# Lesson 0.8: A Fixed Set of Choices and a Record of What Happened

**What you will build.** `Calculator.kt`'s bare-`String` operator symbol
becomes a real `Operator` enum — a type the compiler can check is
always one of exactly four real choices, each one directly carrying its
own `Operation` object — and every completed calculation becomes a real
`Calculation` record, a `data class` with genuine structural equality
and a `copy()` for building variants. The transferable problem
underneath the feature: how to represent "one of a fixed, known set of
choices" so the compiler enforces it, and how to represent "a bundle of
plain data describing one real event" so comparing and duplicating it
means comparing and duplicating what it actually contains, not merely
whether two names happen to point at the identical object.

**What you need to know first.** `Calculator.kt` as Lesson 0.7 left it:
the `Operation` interface, `Addition`/`Subtraction`/`Multiplication`/
`Division` implementing it, `Calculator.perform` calling through it, and
`main`'s `String`-typed `operatorSymbol` selecting one via `when`. Also
`class`, properties, and the primary constructor, from Lesson 0.6.

**Terms used in this lesson**

- **program** — a finite sequence of instructions a computer executes
  in order. This lesson changes how two kinds of data are represented,
  not the fact that the program still runs in sequence.
- **value** — a piece of data a program holds and operates on. This
  lesson's own `Operator.PLUS` and `Calculation(...)` objects are values
  in exactly Lesson 0.1's sense.
- **type** — a category determining what a value's data is and what
  operations are valid on it, checked by the compiler before the
  program runs. This lesson introduces two new *sources* of types: a
  type restricted to a fixed, named set of values, and a type whose
  entire job is holding plain data.
- **`class`** — a blueprint describing what data and behavior a kind of
  object has, given full treatment in Lesson 0.6. Both new type
  categories this lesson introduces are real, specialized variations of
  a class, not something separate from the `class` concept.
- **property** — a value belonging to a specific object, given full
  treatment in Lesson 0.6. `Operator`'s new `operation` property and
  `Calculation`'s four properties are properties in exactly that sense.
- **primary constructor** — the parameter list written directly in a
  class's own declaration, given full treatment in Lesson 0.6. Both
  `Operator` and `Calculation` declare theirs the same way `Calculator`
  already does.
- **interface** — a contract describing what methods a class must
  provide, given full treatment in Lesson 0.7. `Operation`, unchanged
  this lesson, is still exactly that contract.
- **`when`** — a keyword introducing a multi-branch decision, given
  full treatment in Lesson 0.3. This lesson uses it again over a new
  kind of subject — an enum value instead of a `String` — and proves a
  real difference in what the compiler can check about it.
- **`==`** — the comparison operator, given full treatment in Lesson
  0.3, checking whether two values are equal. This lesson proves, for
  the first time, that *what* `==` actually checks depends on the
  type being compared — given full treatment as **structural equality**
  and **identity equality**, below.
- **enum class** — a class restricted to a fixed, named set of possible
  values, each one written directly in the class's own declaration. It
  exists so a value with a genuinely small, known set of valid
  possibilities — a compass direction, a day of the week, a
  calculator's operator symbol — can be represented as a real type the
  compiler checks, rather than a general-purpose type like `String`
  that happens to also accept every value that *isn't* valid, with
  nothing catching the difference until the program actually runs.
- **enum constant** — one of the fixed, named values an `enum class`
  declares — `Operator.PLUS`, in this lesson's own code. It exists as
  the actual member of the fixed set an `enum class` restricts its
  values to; unlike an ordinary object built with `ClassName()`, an
  enum constant is written by name, directly, and there are never more
  or fewer of them than the enum class itself declares.
- **data class** — a class whose entire declared job is holding plain
  data, for which Kotlin automatically generates real, working
  `equals()`, `hashCode()`, `toString()`, and `copy()` methods from its
  primary constructor's properties, instead of requiring a programmer
  to write each one by hand. It exists because a huge fraction of the
  classes any real program declares exist purely to bundle a few
  related values together — a `Calculation`, an `Order`, a database
  row — and hand-writing correct, consistent `equals`/`hashCode`/
  `toString` for every one of them is repetitive, easy to get subtly
  wrong, and rarely worth a programmer's actual attention.
- **structural equality** — two values considered equal because their
  actual contents match, field by field, regardless of whether they're
  the same object in memory. It exists as the natural meaning of
  "equal" for plain data: two separately-built records describing the
  identical real-world fact — the same order, the same calculation —
  should compare equal, because what they represent is the same, even
  though nothing about *how* they were built ties them together.
- **identity equality** — two values considered equal only when they
  are, in fact, the exact same object — proven, in this lesson's own
  Concept Unit 3, to be the *default* meaning of `==` for an ordinary
  class that doesn't opt into anything else. It exists as the honest
  default for an object whose entire point is being one specific,
  individual thing — this curriculum's own `Calculator` object, for
  instance, where a second `Calculator` holding an identical
  `displayValue` is still a genuinely different calculator.
- **`copy()`** — a method Kotlin generates automatically for every
  `data class`, building a new object with the same property values as
  the one it's called on, except for whichever properties are
  explicitly given new values at the call site. It exists so a variant
  of an existing record can be built without re-typing every property
  that isn't actually changing, and without accidentally mutating the
  original object doing it.

**Objects and methods used**

- **`Operator`**
  - *What it is:* this lesson's own new `enum class` — the calculator's
    operator choice, restricted to exactly four real possibilities,
    each one directly carrying its own `Operation` implementation.
  - *Implementation:* `enum class Operator(val operation: Operation) {
    PLUS(Addition()), MINUS(Subtraction()), TIMES(Multiplication()),
    DIVIDE(Division()) }` — four enum constants, each supplying its own
    argument to the shared primary constructor.
  - *Its use:* replaces `main`'s original `String`-typed
    `operatorSymbol` and the `when` expression that used to map it to
    an `Operation`; `main` now reads `operatorChoice.operation`
    directly.
  - *Type:* an `enum class` declaration, with a primary constructor.
  - *Responsibility:* represent exactly one of the calculator's four
    real operator choices, and — because of its constructor parameter —
    also carry that choice's matching `Operation` object directly,
    with no separate lookup required.
  - *Depends on:* nothing at the point it's used (`Operator.PLUS`
    already exists, built once, the moment the program starts); each
    constant's own declaration depends on the matching `Operation`
    implementation to construct.
  - *Connects to:* its `operation` property is read directly by `main`
    and handed to `Calculator.perform`; each constant is built, once,
    from `Addition`, `Subtraction`, `Multiplication`, and `Division`
    (all given full treatment in Lesson 0.7).
  - *Shape:* a fixed, closed set of named choices — a different kind of
    type boundary than `Operation`'s own open-ended interface boundary,
    which any number of future classes could still implement.

- **`Calculation`**
  - *What it is:* this lesson's own new `data class` — a complete
    record of one calculation: which operator, which two operands, and
    what the result was.
  - *Implementation:* `data class Calculation(val operator: Operator,
    val operandA: Int, val operandB: Int, val result: Int)` — four
    properties, all `val`, all supplied through the primary
    constructor; no method bodies written by hand anywhere in its
    declaration.
  - *Its use:* built once, in `main`, immediately after `Calculator`
    finishes a calculation, bundling together everything about that one
    calculation into a single, printable, comparable value.
  - *Type:* a `data class` declaration, with a primary constructor.
  - *Responsibility:* hold exactly the four values that together
    describe one completed calculation — nothing about *performing* a
    calculation belongs to it; that remains `Calculator`'s and
    `Operation`'s own job, given full treatment in Lessons 0.6–0.7.
  - *Depends on:* four values at construction — an `Operator`, and
    three `Int`s.
  - *Connects to:* built in `main`, from `operatorChoice` and the
    calculator's own `displayValue` (given full treatment in Lesson
    0.6) before and after `perform` runs; printed directly, and, in
    Concept Unit 4, copied to build a variant.
  - *Shape:* a plain data boundary — this lesson's own first example of
    a type that exists purely to *describe* something that already
    happened, not to *do* anything itself.

- **`Any.equals`**
  - *What it is:* the method every Kotlin object has, inherited from
    `Any` — the root of Kotlin's entire class hierarchy, given full
    treatment in Lesson 0.6 for its sibling method `toString()` — that
    `==` calls internally to compare two values.
  - *Implementation:* real source, fetched this session from the JDK's
    own bundled `src.zip` (`java.base/java/lang/Object.java`), the real
    implementation an ordinary Kotlin class inherits on the JVM when it
    doesn't provide its own:
    ```java
    public boolean equals(Object obj) {
        return (this == obj);
    }
    ```
    `this == obj` here is Java's own `==`, comparing raw object
    identity (are these two names pointing at the exact same object in
    memory) — not, confusingly, a recursive call to the very method
    being defined; this is the literal, lowest-level identity check
    every ordinary object falls back to unless something overrides it.
  - *Its use:* this lesson's Concept Unit 3 proves directly that an
    ordinary class (not a `data class`) uses exactly this real,
    identity-based check when compared with `==` — given full treatment
    as **identity equality** in this lesson's Header.
  - *Type:* an `open` instance method declared on `Any`, overridden with
    a real body by `java.lang.Object` on the JVM specifically (the same
    inheritance mechanism Lesson 0.6 established for `toString()`).
  - *Responsibility:* decide whether two objects should be considered
    equal — by default, only by asking whether they're the literal same
    object.
  - *Depends on:* the object it's called on, and one argument to
    compare it against.
  - *Connects to:* called by `==` for any ordinary class that doesn't
    override it; a `data class`, given full treatment in this lesson's
    Header, generates its own real override instead — proven directly
    with `javap` in Concept Unit 3, below.
  - *Shape:* a public standard-library contract every Kotlin object
    satisfies automatically, the identity-based default this lesson's
    own `Calculation` deliberately replaces.

- **`Calculator`**
  - *What it is:* the calculator's own class, given full treatment in
    Lessons 0.6–0.7, unchanged in shape this lesson.
  - *Implementation:* unchanged — `class Calculator(var displayValue:
    Int) { fun perform(operation: Operation, amount: Int) { ... } }`.
  - *Its use:* still constructed once in `main`; still the object
    `perform` is called on, now supplied `operatorChoice.operation`
    directly instead of a value chosen by a separate `when` expression.
  - *Type:* a class declaration, with a primary constructor.
  - *Responsibility:* hold one running total and update it by
    delegating to whatever `Operation` it's given — unchanged from
    Lesson 0.7.
  - *Depends on:* one `Int` argument at construction; `perform` depends
    on an `Operation` object and an `Int` amount.
  - *Connects to:* constructed once in `main`; `main` reads
    `calculator.displayValue` both before and after calling `perform`,
    to build this lesson's own new `Calculation` record.
  - *Shape:* the calculator's own domain logic, unchanged in
    architectural role from Lesson 0.7.

- **`main`**
  - *What it is:* the specially-recognized JVM entry point, proven real
    with `javap` in Lesson 0.1.
  - *Implementation:* unchanged in declaration; its body now selects an
    `Operator` constant instead of a `String`, and builds a
    `Calculation` record after the arithmetic completes.
  - *Its use:* still the only reason the JVM knows where to start; now
    also the only place any `Calculation` is ever built.
  - *Type:* a free (top-level) function.
  - *Responsibility:* be the program's single entry point.
  - *Depends on:* nothing to be declared; to run, depends on the file
    being compiled to a `.class` the JVM can load.
  - *Connects to:* called by the JVM's launcher; constructs a
    `Calculator`, reads an `Operator` constant's own `operation`
    property, calls `perform`, then builds and prints a `Calculation`.
  - *Shape:* the outermost public boundary of the whole program.

- **`println`**
  - *What it is:* the standard-library function writing text and a line
    break to standard output.
  - *Implementation:* real source, unchanged from Lesson 0.1
    (`jvmMain/kotlin/io/Console.kt`) — this lesson's calls printing a
    `Calculation` or an `Operator` constant both resolve to the general
    `Any?` overload, since neither type is `Int`, `Boolean`, or any of
    `println`'s other specifically-typed overloads:
    ```kotlin
    /** Prints the given [message] and the line separator to the standard output stream. */
    @kotlin.internal.InlineOnly
    public actual inline fun println(message: Any?) {
        System.out.println(message)
    }
    ```
  - *Its use:* still this lesson's only way to make anything visible,
    now including a `data class`'s own auto-generated text form.
  - *Type:* a top-level `inline` function.
  - *Responsibility:* convert its one argument to text — by calling
    that argument's own `toString()` — and write it, followed by a line
    separator, to standard output.
  - *Depends on:* exactly one argument.
  - *Connects to:* called from `main`; internally calls
    `System.out.println`.
  - *Shape:* a public standard-library API surface, unchanged in role.

---

## Concept Unit: `enum class`

### The Problem

`operatorSymbol`, since Lesson 0.3, has been a plain `String` — which
means, as far as the compiler is concerned, `operatorSymbol` could hold
literally any text at all: `"+"`, `"banana"`, an empty string, anything.
Lesson 0.3's own `when` expression only handles that by falling through
to an `else` branch at runtime — proven, in this lesson's own isolated
lab, to silently produce `"unknown"` rather than catching the problem
any earlier. Given that this curriculum's calculator only ever
genuinely supports four real operators, what do you think it would take
to make "one of exactly these four things, and nothing else" a real
type the compiler enforces, the way `Int` and `Boolean` already are?
If such a type existed, would you expect a value that isn't one of the
four allowed choices to even be possible to write at all?

### Project Change

- **Reference Source** — no reference counterpart; from-scratch, per
  the BRD's `enum class` concept for this lesson.
- **Files affected** — modified: `Calculator.kt`.
- **Change type** — add (a new `enum class` declaration) and replace
  (`operatorSymbol`'s `String` declaration and the `when` expression
  that matched it against string literals).
- **Location** — the enum is added below `Calculator`'s own class; the
  replacement is inside `main`, on `operatorSymbol` and the `when`
  expression from Lesson 0.7.
- **Dependencies** — none beyond Lesson 0.7.

### The New Code

```kotlin
enum class Operator {
    PLUS, MINUS, TIMES, DIVIDE
}
```

and, inside `main`:

```kotlin
val operatorChoice = Operator.PLUS
val operation: Operation = when (operatorChoice) {
    Operator.PLUS -> Addition()
    Operator.MINUS -> Subtraction()
    Operator.TIMES -> Multiplication()
    Operator.DIVIDE -> Division()
}
```

### The Updated Project

```kotlin
1:  interface Operation {
2:      fun apply(current: Int, amount: Int): Int
3:  }
4:
5:  class Addition : Operation {
6:      override fun apply(current: Int, amount: Int): Int {
7:          return current + amount
8:      }
9:  }
10: class Subtraction : Operation {
11:     override fun apply(current: Int, amount: Int): Int {
12:         return current - amount
13:     }
14: }
15: class Multiplication : Operation {
16:     override fun apply(current: Int, amount: Int): Int {
17:         return current * amount
18:     }
19: }
20: class Division : Operation {
21:     override fun apply(current: Int, amount: Int): Int {
22:         return current / amount
23:     }
24: }
25:
26: class Calculator(var displayValue: Int) {
27:     fun perform(operation: Operation, amount: Int) {
28:         displayValue = operation.apply(displayValue, amount)
29:     }
30: }
31:
32: enum class Operator {                       // ← new
33:     PLUS, MINUS, TIMES, DIVIDE                 // ← new
34: }                                               // ← new
35:
36: fun main() {
37:     println("Calculator starting up")
38:     val calculator = Calculator(6)
39:     val operandB: Int? = null
40:     val operatorChoice = Operator.PLUS          // ← changed: was `val operatorSymbol = "+"`
41:     val safeOperandB = operandB ?: 0
42:     val operation: Operation = when (operatorChoice) {  // ← changed: was `when (operatorSymbol)`
43:         Operator.PLUS -> Addition()               // ← changed: was `"+" ->`
44:         Operator.MINUS -> Subtraction()            // ← changed
45:         Operator.TIMES -> Multiplication()          // ← changed
46:         Operator.DIVIDE -> Division()                // ← changed
47:     }                                                  // ← changed: no `else` branch
48:     calculator.perform(operation, safeOperandB)
49:     println(calculator.displayValue)
50: }
```

The `when` expression's own `else -> Addition()` fallback from Lesson
0.7 is gone — this unit's own lab, below, proves why it's no longer
required.

### Introduce the Concept in Isolation

A disposable scratch file
(`verification/0.8/lab1a_string_no_safety.kt`), first confirming
exactly what problem this unit is solving — that a `String`-typed
choice really does accept an invalid value silently:

```kotlin
fun main() {
    val symbol = "x"
    val description = when (symbol) {
        "+" -> "add"
        "-" -> "subtract"
        else -> "unknown"
    }
    println(description)
}
```

Compiled and run this session:

```
$ kotlinc lab1a_string_no_safety.kt -include-runtime -d lab1a_string_no_safety.jar
$ java -jar lab1a_string_no_safety.jar
```

Real output:

```
unknown
```

`"x"` was never a real operator, and nothing caught that — the program
compiled fine and simply printed `"unknown"` at runtime. A second
scratch file, `verification/0.8/lab1b_enum_basics.kt`, shows the
alternative, using a fresh example (compass directions) to confirm this
is a general fact about `enum class`, not something specific to
calculator operators:

```kotlin
enum class Direction {
    NORTH, SOUTH, EAST, WEST
}

fun main() {
    val heading = Direction.NORTH
    println(heading)
    val description = when (heading) {
        Direction.NORTH -> "up"
        Direction.SOUTH -> "down"
        Direction.EAST -> "right"
        Direction.WEST -> "left"
    }
    println(description)
}
```

Compiled and run this session:

```
$ kotlinc lab1b_enum_basics.kt -include-runtime -d lab1b_enum_basics.jar
$ java -jar lab1b_enum_basics.jar
```

Real output:

```
NORTH
up
```

`println(heading)` printed `NORTH` — an **enum constant**'s own default
text form is just its declared name, no quotes, no extra ceremony. The
`when` expression matching `heading` compiled and ran with **no `else`
branch at all** — a real, direct contrast with Lesson 0.3's own
`String`-typed `when`, which demanded one. This is because `Direction`
is an **enum class**: a type restricted to exactly four possible
values, all four of which this `when` already lists — the compiler can
actually *prove* every possible input is covered, something it could
never do for `String`, which can hold infinitely many values no fixed
list could ever exhaust.

A third scratch file, `verification/0.8/break1_enum_invalid.kt`, checks
whether an invalid enum reference is even possible to write at all:

```kotlin
enum class Direction {
    NORTH, SOUTH, EAST, WEST
}

fun main() {
    val heading = Direction.UP
    println(heading)
}
```

Compiled this session (deliberately, to observe the failure):

```
$ kotlinc break1_enum_invalid.kt -include-runtime -d break1_enum_invalid.jar
```

Real compiler output — this file was never run:

```
break1_enum_invalid.kt:6:29: error: unresolved reference 'UP'.
    val heading = Direction.UP
                            ^^
```

`Direction.UP` isn't merely *invalid input at runtime*, the way `"x"`
was for the `String`-typed version — it's not even valid *code*.
`UP` was never declared, so the compiler rejects it before the program
can exist at all — the exact class of problem this unit's Problem
section asked about, resolved.

### Discard the Throwaway Examples

`lab1a_string_no_safety.kt`, `lab1b_enum_basics.kt`, and
`break1_enum_invalid.kt` are scratch, recorded in the verification
folder, not part of the calculator project. What they proved — that a
`String`-typed choice silently accepts invalid values while an `enum
class` rejects them at compile time, and that an exhaustive `when` over
an enum needs no `else` — is exactly what `Operator`'s own declaration,
above, provides.

### Mechanical Walkthrough

Every distinct syntactic element in the New Code:

- **`enum class Operator`** — `enum class`, given full treatment in
  this lesson's Header, a two-word keyword pair (unlike the plain
  `class` given full treatment in Lesson 0.6) marking this declaration
  as restricted to a fixed set of named values, not an ordinary,
  freely-constructible class; `Operator`, an identifier.
- **`PLUS, MINUS, TIMES, DIVIDE`** — four enum constants, given full
  treatment in this lesson's Header: the entire fixed set of values
  `Operator` can ever hold, written by name, comma-separated, inside
  the class's own body — not four separate objects built with `()`
  the way Lesson 0.6 built `Calculator` objects, but the actual,
  complete membership of this type.
- **`val operatorChoice = Operator.PLUS`** — the same `val`/`=` already
  given full treatment; `Operator.PLUS` reads one specific enum
  constant by name, dot-accessed off the enum class itself the same
  syntactic shape Lesson 0.4 already used for `Map.Entry`'s `key`/
  `value` properties, here naming a constant instead of reading an
  instance property.
- **`val operation: Operation = when (operatorChoice) { ... }`** — the
  same `val` and explicit type annotation given full treatment in
  Lesson 0.1; `when`, given full treatment in Lesson 0.3, this time
  matching `operatorChoice` — an `Operator` — against its own four
  possible constants instead of `String` literals; each branch
  (`Operator.PLUS -> Addition()`, and so on) constructs the matching
  `Operation` implementation, the same constructor-call shape given
  full treatment in Lesson 0.7. No `else` branch — proven, by this
  unit's own lab, to be genuinely unnecessary rather than accidentally
  omitted: the compiler itself can verify all four real possibilities
  are already listed.

### CS Lens

Restricting a value to a small, fixed, named set of possibilities,
checked before the program runs, rather than a general type that
happens to also accept every invalid value, is a widely recurring idea
in software design. Also recognized in: a multiple-choice question's
own answer options, deliberately closed rather than open-ended free
text; a traffic light's exactly three real states (never a fourth,
never "off" mid-cycle in normal operation); a physical light switch's
two positions, mechanically incapable of a third; a database column
constrained to a fixed list of valid category values, rejecting an
insert that doesn't match any of them.

### SE Lens

`String`, used for `operatorSymbol` since Lesson 0.3, was not a
mistake — it was the right tool at the time, before this curriculum had
covered enough to introduce a better one. The real cost that choice was
quietly carrying, unaddressed until now: every place in the program
that compared `operatorSymbol` against a literal was a fresh
opportunity for a typo (`"x"` instead of `"+"`) that the compiler could
never catch, only ever discovered by actually running the code down
that exact path. `enum class` doesn't eliminate typos — `Operator.PLIS`
would still fail to compile, proven by this unit's own `break1` lab —
but it moves the failure from "silently wrong at runtime, maybe never
noticed" to "the file doesn't compile at all," the identical tradeoff
Lesson 0.5 already made for `Int` versus `Int?`. This is also a real,
concrete instance of this curriculum's own recurring lesson: representing
data with the *narrowest* type that's actually true, rather than the
most general one that happens to also work, catches entire categories
of bugs before they exist.

### Commands Needed

No new commands — the same `kotlinc ... -include-runtime -d ...` /
`java -jar ...` pair from Lesson 0.1.

### Run It

Real output, `Calculator.kt` at its current state (verified this
session as `step1_operator_enum.kt`):

```
$ kotlinc Calculator.kt -include-runtime -d Calculator.jar
$ java -jar Calculator.jar
```

Real output:

```
Calculator starting up
6
```

Unchanged from Lesson 0.7 — `Operator.PLUS` selects the identical
`Addition` object `"+"` used to select.

### Connect

`operatorSymbol` is now a real, compiler-checked `Operator` instead of
an unrestricted `String`. The next unit removes the `when` expression
entirely, by teaching the enum to carry its own `Operation` directly.

---

## Concept Unit: Enum Constructor Parameters

### The Problem

`Operator`'s own `when` expression, in Concept Unit 1, still exists
purely to map each enum constant to its matching `Operation` object —
four lines of code stating a fact (`PLUS` goes with `Addition`) that
never changes and could just as easily live directly on the enum
constant itself. Given that Lesson 0.6 already established that an
ordinary class's primary constructor can declare a property, and given
that an enum constant is written the same way a constructor call's
arguments are, what do you think it would take for each `Operator`
constant to supply its own `Operation` object directly, at the point
it's declared, rather than through a separate lookup written somewhere
else entirely? If a fifth operator were added later, how many places in
the code would need to change under the `when`-based version from
Concept Unit 1, versus a version where each constant carries its own
`Operation` directly?

### Project Change

- **Reference Source** — no reference counterpart; from-scratch,
  connecting the BRD's `enum class` concept for this lesson directly to
  Lesson 0.7's own `Operation` interface.
- **Files affected** — modified: `Calculator.kt`.
- **Change type** — replace (`Operator`'s declaration gains a primary
  constructor; each constant supplies an argument) and remove (the
  `when` expression from Concept Unit 1, now unnecessary).
- **Location** — the `enum class Operator` declaration and the `val
  operation: Operation = when (...)` block, both from Concept Unit 1.
- **Dependencies** — none beyond Concept Unit 1.

### The New Code

```kotlin
enum class Operator(val operation: Operation) {
    PLUS(Addition()),
    MINUS(Subtraction()),
    TIMES(Multiplication()),
    DIVIDE(Division())
}
```

and, inside `main`:

```kotlin
calculator.perform(operatorChoice.operation, safeOperandB)
```

### The Updated Project

```kotlin
1:  interface Operation {
2:      fun apply(current: Int, amount: Int): Int
3:  }
4:
5:  class Addition : Operation {
6:      override fun apply(current: Int, amount: Int): Int {
7:          return current + amount
8:      }
9:  }
10: class Subtraction : Operation {
11:     override fun apply(current: Int, amount: Int): Int {
12:         return current - amount
13:     }
14: }
15: class Multiplication : Operation {
16:     override fun apply(current: Int, amount: Int): Int {
17:         return current * amount
18:     }
19: }
20: class Division : Operation {
21:     override fun apply(current: Int, amount: Int): Int {
22:         return current / amount
23:     }
24: }
25:
26: class Calculator(var displayValue: Int) {
27:     fun perform(operation: Operation, amount: Int) {
28:         displayValue = operation.apply(displayValue, amount)
29:     }
30: }
31:
32: enum class Operator(val operation: Operation) {  // ← changed
33:     PLUS(Addition()),                               // ← changed
34:     MINUS(Subtraction()),                            // ← changed
35:     TIMES(Multiplication()),                          // ← changed
36:     DIVIDE(Division())                                 // ← changed
37: }
38:
39: fun main() {
40:     println("Calculator starting up")
41:     val calculator = Calculator(6)
42:     val operandB: Int? = null
43:     val operatorChoice = Operator.PLUS
44:     val safeOperandB = operandB ?: 0
45:     calculator.perform(operatorChoice.operation, safeOperandB)  // ← changed: no more `when`
46:     println(calculator.displayValue)
47: }
```

The entire `val operation: Operation = when (operatorChoice) { ... }`
block from Concept Unit 1 is gone — `operatorChoice.operation` reads
the exact same `Operation` directly, with no separate mapping step at
all.

### Introduce the Concept in Isolation

A disposable scratch file (`verification/0.8/lab2_enum_properties.kt`),
using a fresh, unrelated example — greetings, not calculator
operators — to confirm this is a general fact about enum classes:

```kotlin
interface Greeting {
    fun say(): String
}

class Hello : Greeting {
    override fun say(): String {
        return "Hello"
    }
}

class Goodbye : Greeting {
    override fun say(): String {
        return "Goodbye"
    }
}

enum class GreetingType(val greeting: Greeting) {
    ARRIVING(Hello()),
    LEAVING(Goodbye())
}

fun main() {
    val type = GreetingType.ARRIVING
    println(type.greeting.say())
}
```

Compiled and run this session:

```
$ kotlinc lab2_enum_properties.kt -include-runtime -d lab2_enum_properties.jar
$ java -jar lab2_enum_properties.jar
```

Real output:

```
Hello
```

`GreetingType.ARRIVING` was declared with `Hello()` as its own
constructor argument, and `type.greeting.say()` read that exact object
back out and called its real, polymorphic (given full treatment in
Lesson 0.7) `say()` method — proving an enum constant genuinely carries
real constructor-supplied data, not just a name. This confirms
`Operator.PLUS.operation` in the real project reads the exact
`Addition()` object `PLUS`'s own declaration constructed.

### Discard the Throwaway Example

`lab2_enum_properties.kt` is scratch, recorded in the verification
folder, not part of the calculator project. What it proved — that an
enum constant's constructor argument becomes a real, readable property
on that specific constant — is what `Operator.PLUS.operation`, above,
relies on.

### Mechanical Walkthrough

Every distinct syntactic element in the New Code:

- **`enum class Operator(val operation: Operation)`** — `enum class`
  and `Operator`, unchanged from Concept Unit 1; `(val operation:
  Operation)` is a primary constructor, the identical syntax given full
  treatment in Lesson 0.6 for `Calculator(var displayValue: Int)` —
  `val`, marking `operation` as a real, readable property; `Operation`,
  the interface given full treatment in Lesson 0.7, as its declared
  type.
- **`PLUS(Addition())`**, **`MINUS(Subtraction())`**,
  **`TIMES(Multiplication())`**, **`DIVIDE(Division())`** — each enum
  constant, given full treatment in Concept Unit 1, now followed by
  parentheses supplying its own constructor argument — the identical
  constructor-call shape given full treatment in Lesson 0.7, here
  written once per constant instead of once per `when` branch.
- **`operatorChoice.operation`** — property access, the same dot syntax
  given full treatment in Lesson 0.6, reading `operation` directly off
  whichever specific constant `operatorChoice` refers to — `PLUS`'s own
  `Addition()` object, per this constant's own declaration above.
- **`calculator.perform(operatorChoice.operation, safeOperandB)`** —
  the same method call given full treatment in Lesson 0.6 and
  polymorphic dispatch given full treatment in Lesson 0.7, now supplied
  `operatorChoice.operation` directly as its argument.

### CS Lens

Attaching real, structured data directly to each member of a fixed set
of named choices, rather than maintaining a separate lookup table
mapping names to data, keeps a single fact declared in exactly one
place. Also recognized in: a chemical element's own atomic weight,
stored as part of that element's own entry in the periodic table, not a
separate cross-referenced list; a country code's own dialing prefix,
attached to that specific country's own record; a playing card's own
rank and suit, intrinsic to which specific card it is, not looked up
elsewhere; a musical note's own frequency, a property of the note
itself, not a fact requiring a separate reference chart to look up
during a performance.

### SE Lens

Concept Unit 1's `when` expression and this unit's constructor-parameter
approach both correctly map each `Operator` to its `Operation` —
the real difference is where that fact lives. The `when` version keeps
the mapping in `main`, separate from `Operator`'s own declaration,
which means adding a fifth operator later would require remembering to
update *two* places: the enum's own constant list, and the `when`
expression matching it. The constructor-parameter version makes that
mistake structurally impossible — proven directly by this unit's own
Updated Project, where the entire `when` block simply no longer exists
to forget to update. The real cost: `Operator`'s own declaration now
depends on `Operation`, `Addition`, `Subtraction`, `Multiplication`,
and `Division` all being declared first, a dependency the `when`-based
version didn't strictly require in the same way — a minor, honest
tradeoff against a real reduction in places a future change could go
wrong.

### Commands Needed

No new commands.

### Run It

Real output, `Calculator.kt` at its current state (verified this
session as `step2_operator_enum_with_operation.kt`):

```
$ kotlinc Calculator.kt -include-runtime -d Calculator.jar
$ java -jar Calculator.jar
```

Real output:

```
Calculator starting up
6
```

Identical to Concept Unit 1's output — proving the removed `when`
expression was genuinely redundant, not load-bearing.

### Connect

`Operator` now carries its own behavior directly, with no separate
mapping step anywhere in the program. The next unit gives the
calculator's *results* the same kind of real, structured treatment.

---

## Concept Unit: `data class` and Equality

### The Problem

Once `calculator.perform(...)` finishes, `calculator.displayValue`
holds the answer — but nothing about *how that answer was reached*
survives anywhere: which operator, which operands. A calculator worth
using needs some way to represent one complete, finished calculation as
a real, holdable thing — not just the final number, but the whole fact
of it. Given that Lesson 0.6 already established how a class bundles
several properties together, what do you think would happen if two
completely separate objects were built from the same class, with the
exact same property values, and then compared with `==` — would you
expect them to be considered equal, or not? What do you think "equal"
should even mean for two objects that both represent the identical
real-world fact but were constructed independently?

### Project Change

- **Reference Source** — no reference counterpart; from-scratch, per
  the BRD's `data class`/`Equality` concepts for this lesson.
- **Files affected** — modified: `Calculator.kt`.
- **Change type** — add (a new `data class` declaration and two new
  lines inside `main`).
- **Location** — the data class is added below `Operator`; the new
  lines go inside `main`, after `calculator.perform(...)`.
- **Dependencies** — none beyond Concept Units 1–2.

### The New Code

```kotlin
data class Calculation(val operator: Operator, val operandA: Int, val operandB: Int, val result: Int)
```

and, inside `main`:

```kotlin
val operandA = calculator.displayValue
calculator.perform(operatorChoice.operation, safeOperandB)
val calculation = Calculation(operatorChoice, operandA, safeOperandB, calculator.displayValue)
println(calculation)
```

### The Updated Project

```kotlin
1:  interface Operation {
2:      fun apply(current: Int, amount: Int): Int
3:  }
4:
5:  class Addition : Operation {
6:      override fun apply(current: Int, amount: Int): Int {
7:          return current + amount
8:      }
9:  }
10: class Subtraction : Operation {
11:     override fun apply(current: Int, amount: Int): Int {
12:         return current - amount
13:     }
14: }
15: class Multiplication : Operation {
16:     override fun apply(current: Int, amount: Int): Int {
17:         return current * amount
18:     }
19: }
20: class Division : Operation {
21:     override fun apply(current: Int, amount: Int): Int {
22:         return current / amount
23:     }
24: }
25:
26: class Calculator(var displayValue: Int) {
27:     fun perform(operation: Operation, amount: Int) {
28:         displayValue = operation.apply(displayValue, amount)
29:     }
30: }
31:
32: enum class Operator(val operation: Operation) {
33:     PLUS(Addition()),
34:     MINUS(Subtraction()),
35:     TIMES(Multiplication()),
36:     DIVIDE(Division())
37: }
38:
39: data class Calculation(val operator: Operator, val operandA: Int, val operandB: Int, val result: Int)  // ← new
40:
41: fun main() {
42:     println("Calculator starting up")
43:     val calculator = Calculator(6)
44:     val operandB: Int? = null
45:     val operatorChoice = Operator.PLUS
46:     val safeOperandB = operandB ?: 0
47:     val operandA = calculator.displayValue                      // ← new
48:     calculator.perform(operatorChoice.operation, safeOperandB)
49:     val calculation = Calculation(operatorChoice, operandA, safeOperandB, calculator.displayValue)  // ← new
50:     println(calculation)                                          // ← changed: was `println(calculator.displayValue)`
51: }
```

`main` now captures `calculator.displayValue` *before* `perform` runs
(as `operandA`) and builds a full `Calculation` record afterward,
printing that record instead of the bare final number.

### Introduce the Concept in Isolation

A disposable scratch file (`verification/0.8/lab3_data_class.kt`),
comparing an ordinary class against a `data class` built the identical
way, to see what `==` actually does for each:

```kotlin
class PlainPoint(val x: Int, val y: Int)

data class DataPoint(val x: Int, val y: Int)

fun main() {
    val plainA = PlainPoint(1, 2)
    val plainB = PlainPoint(1, 2)
    println(plainA == plainB)

    val dataA = DataPoint(1, 2)
    val dataB = DataPoint(1, 2)
    println(dataA == dataB)
    println(dataA)
}
```

Compiled and run this session:

```
$ kotlinc lab3_data_class.kt -include-runtime -d lab3_data_class.jar
$ java -jar lab3_data_class.jar
```

Real output:

```
false
true
DataPoint(x=1, y=2)
```

`plainA` and `plainB` hold identical `x`/`y` values, built from the
identical class, and `==` still says `false`. This proves **identity
equality** is `PlainPoint`'s real default: `==` calls `Any.equals`,
given full treatment in this lesson's Header — real JDK source,
`return (this == obj)`, a raw check of whether both names point at the
literal same object — and `plainA`/`plainB` are two separate objects,
even with matching data. `dataA` and `dataB`, built the identical way
but from a `data class`, compare `true` — proving `data class` really
does generate its own, different `equals()`, one that compares actual
field values instead of object identity: **structural equality**. The
third line, `DataPoint(x=1, y=2)`, is `dataA`'s own auto-generated
`toString()` — a real, generated method, not `Any`'s own default
`ClassName@hash` form Lesson 0.6 proved for an ordinary object.

To confirm these are real, compiler-generated methods — not something
`println`'s own formatting invents — this session also compiled
`data class Order(val item: String, val quantity: Int, val price: Int)`
(shown in full in Concept Unit 4, below) and inspected the real result
with `javap -p`:

```
$ kotlinc lab4_copy.kt -d classes
$ javap -p classes/Order.class
```

Real output:

```
public final class Order {
  private final java.lang.String item;
  private final int quantity;
  private final int price;
  public Order(java.lang.String, int, int);
  public final java.lang.String getItem();
  public final int getQuantity();
  public final int getPrice();
  public final java.lang.String component1();
  public final int component2();
  public final int component3();
  public final Order copy(java.lang.String, int, int);
  public static Order copy$default(Order, java.lang.String, int, int, int, java.lang.Object);
  public java.lang.String toString();
  public int hashCode();
  public boolean equals(java.lang.Object);
}
```

This is the actual compiled result of writing three property names and
the word `data` — a real constructor, real getters, real `equals`,
`hashCode`, and `toString` overrides, a real `copy` (given full
treatment in Concept Unit 4, next), and three `componentN()` methods
(supporting a destructuring syntax this curriculum has not yet
covered) — none of it hand-written, all of it generated by the compiler
from the primary constructor alone.

### Discard the Throwaway Examples

`lab3_data_class.kt` is scratch, recorded in the verification folder,
not part of the calculator project — the `javap` inspection reused
`lab4_copy.kt`'s own compiled `Order` class rather than compiling a
fresh throwaway for the sole purpose of disassembling it. What they
proved — that a `data class` generates real structural `equals()` and
`toString()` methods, verified both by behavior and by direct bytecode
inspection — is what `Calculation`'s own declaration, above, provides
automatically.

### Mechanical Walkthrough

Every distinct syntactic element in the New Code:

- **`data class Calculation(val operator: Operator, val operandA: Int, val operandB: Int, val result: Int)`**
  — `data class`, given full treatment in this lesson's Header, a
  two-word keyword pair marking this class for automatic
  `equals`/`hashCode`/`toString`/`copy` generation; `Calculation`, an
  identifier; the primary constructor, the same syntax given full
  treatment in Lesson 0.6, declaring four `val` properties: `operator`
  (typed `Operator`, the enum given full treatment in Concept Units
  1–2), and three `Int`s.
- **`val operandA = calculator.displayValue`** — the same `val`/`=`
  already given full treatment, capturing `calculator`'s own
  `displayValue` property (given full treatment in Lesson 0.6) *before*
  `perform` changes it — this is the calculation's starting value,
  read and saved under its own name for the first time in this
  curriculum, rather than only ever read live off the object.
- **`Calculation(operatorChoice, operandA, safeOperandB, calculator.displayValue)`**
  — a constructor call, the same kind given full treatment in Lesson
  0.6, supplying all four of `Calculation`'s properties: `operatorChoice`
  (the enum constant selected earlier), `operandA` (just captured),
  `safeOperandB` (the Elvis-defaulted value given full treatment in
  Lesson 0.5), and `calculator.displayValue` read again — now holding
  the *post-calculation* result, since `perform` already ran on the
  line above.
- **`println(calculation)`** — the same overloaded, `inline`,
  `System.out.println`-delegating function given full treatment in this
  lesson's Header, reappearing here; `calculation` resolves to the
  general `Any?` overload, calling `Calculation`'s own real,
  compiler-generated `toString()` — proven, above, by real `javap`
  output — producing the `Calculation(operator=..., operandA=...,
  ...)` format this unit's own Run It shows.

### CS Lens

Distinguishing "same real-world fact, independently recorded" from
"literally the same object" is a distinction that matters well beyond
this one comparison operator. Also recognized in: two separately
printed copies of the same receipt, describing the identical purchase
without being the same physical piece of paper; two different
people's independent measurements of the same table producing the
identical length; two database queries returning separate row objects
that both describe the same underlying record; a photocopy and its
original, structurally identical in content while remaining two
physically distinct sheets of paper.

### SE Lens

Kotlin could have made every class's `==` compare structurally by
default, the way `data class` does — some languages lean that
direction. Kotlin instead makes identity the default (proven directly
by `PlainPoint`'s own real `false` result above) and requires opting
into structural comparison explicitly, via `data class`. The reason:
identity is the *correct* meaning of equality for a huge number of
real classes — this curriculum's own `Calculator` object, for
instance, where a second `Calculator` holding an identical
`displayValue` is still a genuinely different calculator, not
interchangeable with the first, and treating them as equal would be
an actual bug, not a convenience. `data class` exists specifically for
the other, equally common case: a class whose entire point is *being*
some data, where two independently-built records describing the same
fact genuinely should compare equal — `Calculation`, built here, is
exactly that case, and marking it `data class` states that design
decision plainly, in the type declaration itself, rather than leaving
a future reader to guess which kind of equality a given class is
supposed to have.

### Commands Needed

No new commands.

### Run It

Real output, `Calculator.kt` at its current state (verified this
session as `step3_calculation_data_class.kt`):

```
$ kotlinc Calculator.kt -include-runtime -d Calculator.jar
$ java -jar Calculator.jar
```

Real output:

```
Calculator starting up
Calculation(operator=PLUS, operandA=6, operandB=0, result=6)
```

The full record of the calculation — which operator (printed as
`PLUS`, the enum constant's own default text form, given full treatment
in Concept Unit 1), both operands, and the result — all in one printed
line, generated entirely by the compiler.

### Connect

A completed calculation is now a real, structurally-comparable record.
The last unit in this lesson builds a variant of one without
re-running the whole calculation from scratch.

---

## Concept Unit: `copy()`

### The Problem

Suppose the calculator needed to explore "what if the second operand
had been different" — building a near-identical `Calculation`, changing
only `operandB`, without retyping `operator` and `operandA` by hand
and risking a copy-paste mistake on the values that aren't actually
changing. Given that `Calculation` is a `data class`, and given this
lesson's own Concept Unit 3 already proved, with real `javap` output,
that a `data class` generates a real `copy` method automatically, what
do you think calling it might look like? If only one of `Calculation`'s
four properties needs to change, would you expect to have to supply
all four again, or only the one that's actually different?

### Project Change

- **Reference Source** — no reference counterpart; from-scratch, per
  the BRD's `copy()` concept for this lesson.
- **Files affected** — modified: `Calculator.kt`.
- **Change type** — add (two new lines inside `main`).
- **Location** — inside `main`, immediately after `println(calculation)`
  from Concept Unit 3.
- **Dependencies** — none beyond Concept Unit 3.

### The New Code

```kotlin
val hypothetical = calculation.copy(operandB = 4)
println(hypothetical)
```

### The Updated Project

```kotlin
1:  interface Operation {
2:      fun apply(current: Int, amount: Int): Int
3:  }
4:
5:  class Addition : Operation {
6:      override fun apply(current: Int, amount: Int): Int {
7:          return current + amount
8:      }
9:  }
10: class Subtraction : Operation {
11:     override fun apply(current: Int, amount: Int): Int {
12:         return current - amount
13:     }
14: }
15: class Multiplication : Operation {
16:     override fun apply(current: Int, amount: Int): Int {
17:         return current * amount
18:     }
19: }
20: class Division : Operation {
21:     override fun apply(current: Int, amount: Int): Int {
22:         return current / amount
23:     }
24: }
25:
26: class Calculator(var displayValue: Int) {
27:     fun perform(operation: Operation, amount: Int) {
28:         displayValue = operation.apply(displayValue, amount)
29:     }
30: }
31:
32: enum class Operator(val operation: Operation) {
33:     PLUS(Addition()),
34:     MINUS(Subtraction()),
35:     TIMES(Multiplication()),
36:     DIVIDE(Division())
37: }
38:
39: data class Calculation(val operator: Operator, val operandA: Int, val operandB: Int, val result: Int)
40:
41: fun main() {
42:     println("Calculator starting up")
43:     val calculator = Calculator(6)
44:     val operandB: Int? = null
45:     val operatorChoice = Operator.PLUS
46:     val safeOperandB = operandB ?: 0
47:     val operandA = calculator.displayValue
48:     calculator.perform(operatorChoice.operation, safeOperandB)
49:     val calculation = Calculation(operatorChoice, operandA, safeOperandB, calculator.displayValue)
50:     println(calculation)
51:     val hypothetical = calculation.copy(operandB = 4)  // ← new
52:     println(hypothetical)                                // ← new
53: }
```

### Introduce the Concept in Isolation

A disposable scratch file (`verification/0.8/lab4_copy.kt`), using a
fresh example — a shopping order — to confirm this is a general fact
about `data class`, and to confirm the original object is genuinely
untouched:

```kotlin
data class Order(val item: String, val quantity: Int, val price: Int)

fun main() {
    val original = Order("Widget", 2, 10)
    val revised = original.copy(quantity = 5)
    println(original)
    println(revised)
    println(original == revised)
}
```

Compiled and run this session:

```
$ kotlinc lab4_copy.kt -include-runtime -d lab4_copy.jar
$ java -jar lab4_copy.jar
```

Real output:

```
Order(item=Widget, quantity=2, price=10)
Order(item=Widget, quantity=5, price=10)
false
```

`original` still prints `quantity=2` after `copy()` ran — proving
`copy()` builds a genuinely new, separate object rather than modifying
the one it's called on (consistent with every property here being
`val`, immutable once set, given full treatment in Lesson 0.1).
`revised` carries the new `quantity=5` while `item` and `price` came
through unchanged, copied automatically from `original`. And because
`original` and `revised` now hold genuinely different data, the same
**structural equality** Concept Unit 3 proved says `false` — they
describe two different orders, correctly.

### Discard the Throwaway Example

`lab4_copy.kt` is scratch, recorded in the verification folder, not
part of the calculator project. What it proved — that `copy()` builds
an independent object, changing only the properties explicitly named —
is what `calculation.copy(operandB = 4)`, above, relies on.

### Mechanical Walkthrough

Every distinct syntactic element in the New Code:

- **`calculation.copy(operandB = 4)`** — `calculation`, reading the
  `Calculation` object built in Concept Unit 3; `.copy(...)`, the real,
  compiler-generated method given full treatment in this lesson's
  Header and proven real by this lesson's own `javap` output; `operandB
  = 4`, a named argument — stating explicitly which one of
  `Calculation`'s four properties this call is changing, `operator`,
  `operandA`, and `result` all copied through from `calculation`
  unchanged.
- **`val hypothetical = ...`** — the same `val`/`=` already given full
  treatment, naming the new, independent object `copy()` returns.
- **`println(hypothetical)`** — the same overloaded, `inline`,
  `System.out.println`-delegating function given full treatment in this
  lesson's Header, calling `hypothetical`'s own generated `toString()`
  the identical way Concept Unit 3 already proved for `calculation`
  itself.

### CS Lens

Building a modified copy of an existing record, rather than mutating
the original in place, is a recurring pattern anywhere the original
needs to remain trustworthy and unchanged. Also recognized in: a
photo-editing "Save As" that preserves the original file while writing
a new, edited one; a document's "track changes" revision, which exists
alongside the original rather than overwriting it; a spreadsheet's
"duplicate sheet" function, letting one column be experimented with
freely without risking the source data; a version-controlled file's own
history, where every commit is a new, complete snapshot rather than an
overwrite of the one before it.

### SE Lens

Note what `hypothetical` actually shows once printed: `result` still
reads `6` — the same result `calculation` itself already had — even
though `operandB` changed to `4`. This is not a bug in `copy()`;
it's an honest, important limit on what `copy()` actually does:
it duplicates *stored data*, verbatim, and nothing more — it has no
way to know that `result` was originally *computed from* `operandB`,
because a `data class`'s generated `copy()` has no concept of any
relationship between its own properties at all. Using `copy()`
correctly here would mean also recomputing `result` by hand
(`calculation.operator.operation.apply(calculation.operandA, 4)`) and
supplying *that* to `copy()` as well — a real, easy-to-miss trap this
lesson deliberately leaves visible rather than silently avoiding: a
generated `copy()` is a mechanical, field-by-field tool, not a
guarantee that the resulting object is still internally consistent.

### Commands Needed

No new commands.

### Run It

Real output, `Calculator.kt`'s complete, final state for this lesson
(verified this session as `step4_calculation_copy.kt`):

```
$ kotlinc Calculator.kt -include-runtime -d Calculator.jar
$ java -jar Calculator.jar
```

Real output:

```
Calculator starting up
Calculation(operator=PLUS, operandA=6, operandB=0, result=6)
Calculation(operator=PLUS, operandA=6, operandB=4, result=6)
```

The second `Calculation` shows `operandB=4` where the first showed
`operandB=0` — everything else carried through unchanged, including
the (now honestly stale) `result`, exactly as this unit's own SE Lens
describes.

### Connect

A completed calculation can now be recorded, compared structurally, and
varied without disturbing the original. This is the last new concept
this lesson introduces.

---

## Connect the Pieces

Follow `calculation` through every unit this lesson built, using
`Calculator.kt`'s real final state:

1. `main` starts (the same real JVM entry point Lesson 0.1 proved with
   `javap`) and prints `Calculator starting up`.
2. `val calculator = Calculator(6)` and `val operatorChoice =
   Operator.PLUS` run (Concept Units 1–2): `Operator.PLUS`, one of
   exactly four real, compiler-checked possibilities, already carries
   its own `Addition()` object via its own constructor parameter.
3. `val operandA = calculator.displayValue` captures `6` — the
   calculator's running total *before* anything changes it.
4. `calculator.perform(operatorChoice.operation, safeOperandB)` runs
   (Concept Unit 2): `operatorChoice.operation` reads `PLUS`'s own
   `Addition` object directly, no `when` required; `perform` calls its
   real `apply`, using the real `Int.plus` this curriculum proved in
   Lesson 0.1, updating `displayValue` to `6` (since `safeOperandB` is
   `0`, per the real `?:` fallback Lesson 0.5 proved for a `null`
   `operandB`).
5. `val calculation = Calculation(operatorChoice, operandA,
   safeOperandB, calculator.displayValue)` builds a real
   **structurally-equal-by-value** record (Concept Unit 3): `PLUS`,
   `6`, `0`, and `6` — the complete story of this one calculation.
6. `println(calculation)` prints
   `Calculation(operator=PLUS, operandA=6, operandB=0, result=6)` —
   `Calculation`'s own real, compiler-generated `toString()`, proven
   with real `javap` output to exist alongside real `equals`,
   `hashCode`, and `copy` methods, none of them hand-written.
7. `val hypothetical = calculation.copy(operandB = 4)` builds a second,
   independent `Calculation` (Concept Unit 4) — `calculation` itself
   provably unchanged, `hypothetical` carrying the new `operandB` and
   the same (honestly stale) `result`.
8. `println(hypothetical)` prints the second record.

Three lines of real, verified terminal output are the complete result
of a calculator whose operator choice is now a closed, compiler-checked
set, and whose completed calculations are now real, comparable,
copyable records — every claim in this lesson backed by a real compile
error, a real run, or real `javap` output, never merely asserted.
Lesson 0.9 picks this file back up to teach functions as values, through
lambdas.
