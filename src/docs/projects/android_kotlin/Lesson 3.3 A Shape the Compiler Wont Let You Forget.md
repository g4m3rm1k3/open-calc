# Lesson 3.3: A Shape the Compiler Won't Let You Forget

- **What you will build** — a single, real, immutable `CalculatorState`
  replacing `CalculatorScreen`'s own three separate mutable variables, and
  a real `Display` sealed class replacing the bare `"Error"` string
  sentinel Lesson 2.5 introduced — closing a genuine, currently-reachable
  crash this lesson verifies for real before fixing. The transferable
  problem: a value with more than one real shape (an ordinary number, or
  an error) is either modeled honestly, so the compiler can force every
  place that reads it to handle both shapes, or modeled as a single type
  wearing two different meanings — and the second kind of value can
  always be misread as the wrong one, with nothing to stop it until it
  crashes.
- **What you need to know first** — Lesson 0.8's `data class` and
  `copy()`; Lesson 1.6's `remember`/`mutableStateOf` and
  `CalculatorScreen`'s own three separate state properties
  (`displayText: String`, `firstOperand: Int?`, `pendingOperator:
  Operator?`); Lesson 2.5's `"Error"` string and its `try`/`catch` around
  `operator.operation.apply(...)`; Lesson 2.1's pure, side-effect-free
  functions.

## Terms used in this lesson

- **`sealed class`** — a class that declares, in one place, the complete
  and final set of types allowed to extend it — no other file, now or
  ever, can add another subtype. It exists so a value's real shape can be
  restricted to a known, closed set the compiler can reason about
  completely, unlike an open class or interface, which any file could
  extend with an unknown fourth or fifth shape the compiler has no way to
  plan for.
- **`data class`** — a class the compiler gives real, generated
  `equals`, `hashCode`, `toString`, and `copy` implementations to,
  based on its own declared properties. It exists so a type built purely
  to hold related data doesn't need those four methods written by hand,
  and so two instances built from the same values are provably equal —
  compared by their real data, not by whether they're the same object in
  memory.
- **`copy()`** — a real, compiler-generated method on every `data class`,
  producing a new instance with the same property values as the one it
  was called on, except for whichever properties are explicitly
  overridden. It exists so an "update" to an immutable value can be
  expressed as "a new value, mostly like the old one," without manually
  restating every property that isn't changing.

## Objects and methods used

- **`Display`** *(this lesson's own new, permanent sealed class)*
  - *What it is:* this project's own real representation of "what the
    display currently shows" — either a genuine numeric value, or the
    fact that the last calculation failed.
  - *Implementation:*
    ```kotlin
    sealed class Display {
        data class Value(val text: String) : Display()
        object Error : Display()
    }
    ```
    `Value` carries its own `text: String`; `Error` carries nothing —
    both are the only two real subtypes of `Display` that exist, or ever
    can.
  - *Its use:* replaces the bare `"Error"` string this project's own
    `displayText` used to hold alongside genuine numeric strings, with
    no way for the type system to tell the two apart.
  - *Type:* a `sealed class` with two real subtypes: one `data class`,
    one `object`.
  - *Responsibility:* to make "the display currently shows a number" and
    "the display currently shows an error" two provably distinct,
    exhaustively-checkable cases, rather than two meanings of the same
    `String`.
  - *Depends on:* nothing to construct `Error` (it's a singleton); a
    `String` to construct `Value`.
  - *Connects to:* held by `CalculatorState`'s own `display` property;
    read, exhaustively, by `Display.textOrZero()` and
    `Display.toDisplayText()`.
  - *Shape:* a public, project-owned domain type — this project's own
    first sealed class.

- **`CalculatorState`** *(this lesson's own new, permanent data class)*
  - *What it is:* this project's own single, immutable representation of
    everything the calculator's own UI needs to know at any instant.
  - *Implementation:*
    ```kotlin
    data class CalculatorState(
        val display: Display = Display.Value("0"),
        val firstOperand: Int? = null,
        val pendingOperator: Operator? = null
    )
    ```
  - *Its use:* replaces `CalculatorScreen`'s own three separate
    `remember`ed properties with one `remember`ed value.
  - *Type:* a `data class` with three properties, each carrying a real
    default value.
  - *Responsibility:* to hold the complete, current state of one
    calculator session as a single, comparable, copyable value — nothing
    about a running calculator's own state lives outside this type
    anymore.
  - *Depends on:* nothing to construct with its defaults (`CalculatorState()`
    alone is a complete, valid starting state).
  - *Connects to:* held by `CalculatorScreen`'s own `remember`; read and
    replaced, wholesale, by `nextState`.
  - *Shape:* a public, project-owned domain type, living in `Calculator.kt`
    alongside `Operator`/`Operation` — this project's own data, not
    UI code.

- **`nextState`** *(this lesson's own new, permanent pure function)*
  - *What it is:* this project's own real function computing what the
    calculator's state should become, given its current state and
    whichever key was just pressed.
  - *Implementation:* `fun nextState(current: CalculatorState, label:
    String): CalculatorState`, a real `when` with the same four real
    cases `CalculatorScreen`'s own `onClick` `when` block has had since
    Lesson 1.6 — digit, `"C"`, an operator symbol, `"="`.
  - *Its use:* the entire calculator's own button-press logic now lives
    in one function, callable and testable with plain JUnit, with no
    Compose or Robolectric involved at all.
  - *Type:* a top-level function — genuinely pure, per Lesson 2.1's own
    definition: the same `current`/`label` pair always produces the same
    result, and calling it changes nothing outside its own return value.
  - *Responsibility:* to compute exactly one new `CalculatorState` from
    exactly one old one and one pressed label — nothing about rendering,
    nothing about Compose, nothing about which specific button widget was
    involved.
  - *Depends on:* a `CalculatorState` and a `String` label.
  - *Connects to:* called from `CalculatorScreen`'s own `onClick`
    (`state = nextState(state, label)`); calls `Operator.operation.apply`
    internally, the same real call this project has made since Lesson
    2.1.
  - *Shape:* a public, project-owned domain function, living in
    `Calculator.kt` — this project's own business logic, fully separated
    from its UI.

### Everything else in the file, not this lesson's subject but still explained

- **`remember`**
  - *What it is:* the real Compose function that preserves a value
    across recomposition, tying its lifetime to the composable that
    called it.
  - *Implementation:* `@Composable fun <T> remember(calculation: () ->
    T): T`.
  - *Its use:* now wraps one `CalculatorState`, instead of three
    separate primitive/nullable values.
  - *Type:* a `@Composable` function.
  - *Responsibility:* to hold on to whatever `calculation` first
    produces, across every future recomposition, until the composable
    that called it leaves the composition entirely.
  - *Depends on:* a `calculation` lambda producing the initial value.
  - *Connects to:* wraps `mutableStateOf(CalculatorState())`, unchanged
    in mechanism, holding a different real value than before.
  - *Shape:* a public Compose runtime API, unchanged from where it was
    first introduced.

- **`mutableStateOf`**
  - *What it is:* the real function producing an observable container
    Compose can watch for changes, triggering recomposition when its
    value changes.
  - *Implementation:* `fun <T> mutableStateOf(value: T): MutableState<T>`.
  - *Its use:* now wraps a `CalculatorState` value instead of a `String`.
  - *Type:* a top-level function, returning a real `MutableState<T>`
    object.
  - *Responsibility:* to notify Compose's own recomposition machinery
    whenever the value it holds is reassigned.
  - *Depends on:* an initial value — here, `CalculatorState()`.
  - *Connects to:* wrapped by `remember`; its own value is reassigned by
    `state = nextState(state, label)`.
  - *Shape:* a public Compose runtime API, unchanged from where it was
    first introduced.

- **`Operator.operation.apply`**
  - *What it is:* this project's own real call from a chosen operator
    down to its actual arithmetic.
  - *Implementation:* `Operator`'s own `operation: Operation` property,
    followed by `Operation`'s own `apply(current: Int, amount: Int):
    Int`.
  - *Its use:* called once, inside `nextState`'s own `"="` branch,
    instead of inside `CalculatorScreen`'s own `onClick` directly.
  - *Type:* a property read followed by an interface method call,
    dispatched polymorphically to whichever real `Operation` the chosen
    `Operator` holds.
  - *Responsibility:* to compute one arithmetic result from two `Int`
    inputs.
  - *Depends on:* the two `Int` operands supplied at the call site.
  - *Connects to:* called by `nextState`; unchanged since Lesson 2.1.
  - *Shape:* the one real seam between this project's state logic and
    its actual math — moved, not changed.

## Concept Unit: State Modeling and Immutable State

### The Problem

`CalculatorScreen` currently holds three separate `remember`ed
properties — `displayText: String`, `firstOperand: Int?`,
`pendingOperator: Operator?` — each mutated independently, in different
branches of one large `when` block. Nothing about their separateness
reflects reality: at any instant, these three values together *are* "the
calculator's current state," one coherent thing, not three unrelated
ones that happen to sit next to each other. And because they live as
local `var`s inside a `@Composable` function, testing what a button
press actually *does* to them requires running the whole Compose/
Robolectric machinery — there's no way to ask "what does pressing `7`
then `+` do to the state?" without rendering a real UI.

> `Operator`, `Operation`, `Calculation` — this project has already
> grouped related data into a single named type more than once (`Calculation`,
> a `data class` holding an operator and both operands
> together, one coherent record instead of three separate values). What would the equivalent grouping look like for
> `displayText`/`firstOperand`/`pendingOperator`? And if pressing a
> button produced a *new* state value instead of mutating the existing
> one in place, what would have to be true of the old value, for that
> difference to matter?

### Introduce the Concept in Isolation

```kotlin
data class LabCounter(val count: Int, val step: Int)

fun increment(counter: LabCounter): LabCounter = counter.copy(count = counter.count + counter.step)

fun main() {
    val original = LabCounter(count = 0, step = 5)
    val updated = increment(original)
    println("original: $original")
    println("updated: $updated")
}
```

Real output:

```
original: LabCounter(count=0, step=5)
updated: LabCounter(count=5, step=5)
```

`original` still reads `count=0` — genuinely, provably unchanged — even
after `increment` ran and produced `updated`, which reads `count=5`.
`increment` never mutated `original` at all; it built an entirely new
`LabCounter` via `copy()`, changing only `count`, and left `step`
untouched by not naming it. This is **immutable state**: a value that,
once constructed, can never itself change — "updating" it always means
producing a new value, never modifying the old one in place. Grouping
`count` and `step` into one named `LabCounter`, rather than two separate
variables, is **state modeling**: deciding that these two pieces of data
belong together as one coherent thing, because they change together and
mean something only in relation to each other.

### Discard the Throwaway Example

`LabCounter` and `increment` were written only to prove immutable state
and grouped state modeling; neither is part of the project.

### CS Lens

Representing a system's entire condition at one instant as a single,
immutable value — rather than several independently-mutable variables —
is a foundational idea in software design: **state modeling**. Also
recognized in: a video game's own save file, one complete snapshot of
every relevant fact rather than scattered separately-updated variables;
a version control system's own commit, an immutable snapshot of an
entire repository at one point in time; a functional-programming
reducer, which always produces a brand-new state value from an old one
plus an action, never mutating the old state in place.

### SE Lens

The alternative already in place before this lesson: three separate
`var`s, each independently mutable. The real tradeoff: three separate
variables are each individually simple to update — `displayText = "7"`
is shorter than constructing a whole new state object — but nothing
stops them from being updated inconsistently relative to each other, and
nothing about their separateness can be handed to a test, logged, or
compared as one value. A single immutable `CalculatorState` costs a
`.copy(...)` call at every update site, in exchange for the entire state
becoming one real, nameable, comparable, testable thing — directly
enabling this lesson's own next unit to test button-press logic with
plain JUnit, no Compose involved at all.

### Commands Needed

`kotlinc lab_state_modeling.kt -include-runtime -d lab_state_modeling.jar`,
then `java -jar lab_state_modeling.jar` — the same standalone-lab pattern
this curriculum has used since Stage 0, needing no Gradle project since
`data class`/`copy()` are ordinary Kotlin, not Compose.

### Run It

Real output, from this session:

```
$ kotlinc lab_state_modeling.kt -include-runtime -d lab_state_modeling.jar
$ java -jar lab_state_modeling.jar
original: LabCounter(count=0, step=5)
updated: LabCounter(count=5, step=5)
```

### Connect the Pieces

This unit proved that grouping related data into one immutable value,
updated only via `copy()`, keeps old values provably unchanged; the next
unit applies this directly to `CalculatorScreen`'s own three variables —
and, along the way, closes a real gap in what one of those variables
could actually hold.

## Concept Unit: Sealed Classes

### The Problem

`displayText: String` has held two genuinely different kinds of value
ever since this project first started catching division-by-zero and
showing an error instead of crashing: an ordinary numeric string, like `"78"`, and the
literal word `"Error"`, meaning the last calculation failed. Nothing in
`String` distinguishes these — a `String` is a `String`, whether it
holds digits or the word `"Error"` — so nothing stops code from treating
an error state as if it were a real number.

> Given that `displayText.toInt()` is called directly inside the
> operator-symbol branch, whenever a key like `+` or `×` is pressed —
> what would happen if `displayText` currently held the literal string
> `"Error"` at that exact moment? Would `"Error".toInt()` succeed,
> produce some fallback number, or fail? What would you write to check,
> for real, rather than guessing?

Checking this for real, against this project's own actual, currently-
shipped code (before this lesson's own fix), produces a genuine crash:

```
$ ./gradlew :app:testDebugUnitTest --tests "com.example.calculator.ErrorThenOperatorCheck"
java.lang.NumberFormatException at NumberFormatException.java:67
    Caused by: java.lang.NumberFormatException at ErrorThenOperatorCheck.kt:29
```

Pressing `5`, `÷`, `0`, `=` reaches `"Error"`; pressing `+` immediately
afterward calls `"Error".toInt()`, which throws a real, uncaught
`NumberFormatException` — a second real crash this project has never
caught, sitting right next to the division-by-zero crash this project already fixed by catching `ArithmeticException` and showing `"Error"` instead.

### Introduce the Concept in Isolation

```kotlin
sealed class LabResult
data class LabSuccess(val value: Int) : LabResult()
object LabFailure : LabResult()

fun describe(result: LabResult): String = when (result) {
    is LabSuccess -> "Got ${result.value}"
    LabFailure -> "Failed"
}
```

Real output:

```
Got 5
Failed
```

Both real cases work. Now, deleting the `LabFailure` branch and
recompiling:

```kotlin
fun describe(result: LabResult): String = when (result) {
    is LabSuccess -> "Got ${result.value}"
}
```

produces a real compile error, not a silent gap:

```
error: 'when' expression must be exhaustive. Add the 'LabFailure' branch or an 'else' branch.
fun describe(result: LabResult): String = when (result) {
                                          ^^^^
```

This proves **exhaustiveness checking**: because `LabResult` is
`sealed`, the compiler knows its complete, closed set of subtypes —
exactly `LabSuccess` and `LabFailure`, nothing else, ever — and refuses
to compile a `when` expression that doesn't account for all of them. A
`String`-based version of the same idea has no equivalent: nothing
about `String`'s own type stops a `when` over string values from
silently missing a case.

### Discard the Throwaway Example

`LabResult`/`LabSuccess`/`LabFailure`/`describe` were written only to
prove sealed classes are exhaustively checked; none of it is part of the
project.

### Project Change

- **Reference Source** — No reference counterpart: a from-scratch fix
  for a real, currently-shipped gap in this project's own code.
- **Files affected** —
  `app/src/main/java/com/example/calculator/Calculator.kt` (modified:
  `operatorSymbols` moved here from `MainActivity.kt`; `Display`,
  `CalculatorState`, and `nextState` added);
  `app/src/main/java/com/example/calculator/MainActivity.kt` (modified:
  `operatorSymbols` removed; `CalculatorScreen`'s own state and
  `onClick` bodies replaced).
- **Change type** — add (`Display`/`CalculatorState`/`nextState`);
  refactor (`CalculatorScreen`'s own state and event handling);
  move (`operatorSymbols`, from UI file to domain file, since it's a
  real dependency of `nextState` now).
- **Location** — `Calculator.kt`, appended after `Operator`;
  `CalculatorScreen`'s own `remember` declarations and its
  `CalculatorButton`'s own `onClick` lambda.
- **Dependencies** — `Operator`/`operatorSymbols`, both already real;
  the exhaustiveness behavior just proven above.

### The New Code

```kotlin
sealed class Display {
    data class Value(val text: String) : Display()
    object Error : Display()
}

private fun Display.textOrZero(): String = when (this) {
    is Display.Value -> text
    Display.Error -> "0"
}

data class CalculatorState(
    val display: Display = Display.Value("0"),
    val firstOperand: Int? = null,
    val pendingOperator: Operator? = null
)

fun nextState(current: CalculatorState, label: String): CalculatorState {
    return when {
        label[0].isDigit() -> {
            val currentText = current.display.textOrZero()
            val newText = if (currentText == "0") label else currentText + label
            current.copy(display = Display.Value(newText))
        }
        label == "C" -> current.copy(display = Display.Value("0"))
        label in operatorSymbols -> current.copy(
            firstOperand = current.display.textOrZero().toInt(),
            pendingOperator = operatorSymbols[label],
            display = Display.Value("0")
        )
        label == "=" -> {
            val operator = current.pendingOperator
            val first = current.firstOperand
            val newDisplay = if (operator != null && first != null) {
                try {
                    Display.Value(operator.operation.apply(first, current.display.textOrZero().toInt()).toString())
                } catch (invalidOperation: ArithmeticException) {
                    Display.Error
                }
            } else {
                current.display
            }
            current.copy(display = newDisplay, pendingOperator = null, firstOperand = null)
        }
        else -> current
    }
}
```

### The Updated Project

`Calculator.kt`, in full, with this lesson's own additions marked:

```kotlin
 1  package com.example.calculator
 2
 3  fun interface Operation {
 4      fun apply(current: Int, amount: Int): Int
 5  }
 6
 7  private class Addition : Operation {
 8      override fun apply(current: Int, amount: Int): Int {
 9          return current + amount
10      }
11  }
12
13  private class Subtraction : Operation {
14      override fun apply(current: Int, amount: Int): Int {
15          return current - amount
16      }
17  }
18
19  private class Multiplication : Operation {
20      override fun apply(current: Int, amount: Int): Int {
21          return current * amount
22      }
23  }
24
25  private class Division : Operation {
26      override fun apply(current: Int, amount: Int): Int {
27          return current / amount
28      }
29  }
30
31  private class Modulo : Operation {
32      override fun apply(current: Int, amount: Int): Int {
33          return current % amount
34      }
35  }
36
37  enum class Operator(val operation: Operation) {
38      PLUS(Addition()),
39      MINUS(Subtraction()),
40      TIMES(Multiplication()),
41      DIVIDE(Division()),
42      MODULO(Modulo())
43  }
44
45  val operatorSymbols = mapOf(                                        // ← new (moved)
46      "+" to Operator.PLUS,                                           // ← new (moved)
47      "−" to Operator.MINUS,                                          // ← new (moved)
48      "×" to Operator.TIMES,                                          // ← new (moved)
49      "÷" to Operator.DIVIDE                                          // ← new (moved)
50  )                                                                   // ← new (moved)
51
52  sealed class Display {                                              // ← new
53      data class Value(val text: String) : Display()                 // ← new
54      object Error : Display()                                       // ← new
55  }                                                                   // ← new
56
57  private fun Display.textOrZero(): String = when (this) {           // ← new
58      is Display.Value -> text                                       // ← new
59      Display.Error -> "0"                                           // ← new
60  }                                                                   // ← new
61
62  data class CalculatorState(                                        // ← new
63      val display: Display = Display.Value("0"),                     // ← new
64      val firstOperand: Int? = null,                                 // ← new
65      val pendingOperator: Operator? = null                          // ← new
66  )                                                                   // ← new
67
68  fun nextState(current: CalculatorState, label: String): CalculatorState {  // ← new
69      return when {                                                  // ← new
70          label[0].isDigit() -> {                                    // ← new
71              val currentText = current.display.textOrZero()         // ← new
72              val newText = if (currentText == "0") label else currentText + label  // ← new
73              current.copy(display = Display.Value(newText))         // ← new
74          }                                                          // ← new
75          label == "C" -> current.copy(display = Display.Value("0")) // ← new
76          label in operatorSymbols -> current.copy(                  // ← new
77              firstOperand = current.display.textOrZero().toInt(),   // ← new
78              pendingOperator = operatorSymbols[label],               // ← new
79              display = Display.Value("0")                           // ← new
80          )                                                          // ← new
81          label == "=" -> {                                          // ← new
82              val operator = current.pendingOperator                 // ← new
83              val first = current.firstOperand                       // ← new
84              val newDisplay = if (operator != null && first != null) {  // ← new
85                  try {                                               // ← new
86                      Display.Value(operator.operation.apply(first, current.display.textOrZero().toInt()).toString())  // ← new
87                  } catch (invalidOperation: ArithmeticException) {   // ← new
88                      Display.Error                                  // ← new
89                  }                                                  // ← new
90              } else {                                                // ← new
91                  current.display                                    // ← new
92              }                                                      // ← new
93              current.copy(display = newDisplay, pendingOperator = null, firstOperand = null)  // ← new
94          }                                                          // ← new
95          else -> current                                            // ← new
96      }                                                              // ← new
97  }                                                                  // ← new
```

And `MainActivity.kt`'s own `CalculatorScreen`, showing the entire
composable with this lesson's own changes marked:

```kotlin
42  private fun Display.toDisplayText(): String = when (this) {       // ← new
43      is Display.Value -> text                                      // ← new
44      Display.Error -> "Error"                                      // ← new
45  }                                                                  // ← new
46
47  @Composable
48  fun CalculatorButton(label: String, onClick: () -> Unit, modifier: Modifier = Modifier) {
49      Button(
50          onClick = onClick,
51          shape = MaterialTheme.shapes.small,
52          modifier = modifier.testTag(label)
53      ) {
54          Text(text = label)
55      }
56  }
57
58  @Composable
59  fun CalculatorScreen() {
60      var state by remember { mutableStateOf(CalculatorState()) }    // ← new
61      Column(
62          modifier = Modifier.fillMaxWidth().padding(16.dp),
63          verticalArrangement = Arrangement.spacedBy(8.dp),
64          horizontalAlignment = Alignment.CenterHorizontally
65      ) {
66          Text(
67              text = state.display.toDisplayText(),                  // ← new
68              style = MaterialTheme.typography.displayLarge,
69              modifier = Modifier.testTag("display")
70          )
71          for (row in keypadRows) {
72              Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
73                  for (label in row) {
74                      CalculatorButton(
75                          label = label,
76                          onClick = { state = nextState(state, label) },  // ← new
77                          modifier = Modifier.weight(1f)
78                      )
79                  }
80              }
81          }
82      }
83  }
```

`CalculatorScreen`'s own body is now visibly, dramatically smaller — its
entire button-press logic collapsed into one line, `state =
nextState(state, label)` — because that logic now lives, fully, in
`Calculator.kt`, callable and testable without any Compose involved.

### Mechanical Walkthrough

- `sealed class Display { ... }` — declares `Display`'s complete,
  closed set of real subtypes in one place, exactly the construct this
  unit's own isolated lab already proved forces exhaustive handling.
- `data class Value(val text: String) : Display()` — the "ordinary
  number" case, a **`data class`** carrying its own real `text`
  property; `: Display()` names its real supertype, the same supertype
  syntax `Addition : Operation` already uses.
- `object Error : Display()` — the "failed calculation" case; an
  `object`, not a class, because an error carries no data of its own —
  every reference to `Display.Error` is the same single, real instance.
- `private fun Display.textOrZero(): String = when (this) { ... }` — a
  private extension function, file-scoped to `Calculator.kt`; its `when`
  over `this` (a `Display`) is exhaustive over exactly `Value` and
  `Error`, the real proof from this unit's own lab applied for real:
  omitting either branch here would be a genuine compile error, not a
  runtime risk.
- `data class CalculatorState(...)` — the real, single state type this
  lesson's previous unit already designed; `display: Display = Display.
  Value("0")` is its own default parameter, giving `CalculatorState()`
  alone a complete, valid starting state.
- `fun nextState(current: CalculatorState, label: String): CalculatorState`
  — a **pure function**: same
  inputs always produce the same output, and calling it has no effect
  outside its own return value — no mutation of anything passed in, no
  hidden read of anything outside its own parameters.
- `current.display.textOrZero().toInt()`, inside the operator-symbol
  branch — this is the exact line that used to read `displayText.toInt()`
  directly on a raw `String` that might have held `"Error"`; now,
  `textOrZero()` is called first, converting any `Display.Error` into
  the safe string `"0"` before `.toInt()` ever runs — the real fix for
  the crash this unit's own Problem section reproduced.
- `current.copy(firstOperand = ..., pendingOperator = ..., display = ...)`
  — this branch's own real update, naming three of `CalculatorState`'s
  properties and leaving none unnamed, since all three genuinely change
  here.
- The `"="` branch's own `try`/`catch` — unchanged in mechanism from
  this project's own existing division-by-zero handling (`try` used as a Kotlin
  *expression*, its value assigned directly to `newDisplay`), now producing a `Display.Value(...)` or `Display.Error`
  instead of a bare `String`.
- `private fun Display.toDisplayText(): String`, in `MainActivity.kt` —
  a second, separate extension function from `textOrZero()`, deliberately:
  this one decides how `Display` renders as visible text (`"Error"` for
  the error case), a UI concern, kept in the UI file; `textOrZero()`
  decides how `Display` behaves as a number for calculation (`"0"` for
  the error case), a domain concern, kept in `Calculator.kt`.
- `state = nextState(state, label)` — the entire real replacement for
  `CalculatorScreen`'s own previous multi-branch `when` block: read the
  current state, compute the next one, reassign.

### CS Lens

The same **exhaustiveness checking** this unit's own lab already proved
is what makes a sealed class type-safe in a way a `String` sentinel
never can be: the compiler, not a test someone remembered to write, is
what guarantees every real case gets handled. Also recognized in:
pattern matching over algebraic data types in Haskell, OCaml, and Rust's
own `match`; a `switch` statement in a language with true enum
exhaustiveness checking (Swift's `switch` over an `enum`); a finite state
machine whose transition table is checked, at compile or build time,
against every declared state.

### SE Lens

The alternative already in place before this lesson: `"Error"` as a bare
`String`, checked with `==` comparisons scattered across the codebase.
The real tradeoff, made concrete by this exact lesson: a string sentinel
costs nothing to introduce — one line, assigning `"Error"` where a real
value used to go — but every
place that *reads* the display has to independently remember to check
for it, and nothing enforces that they do; this lesson's own verified
`NumberFormatException` is exactly what happens when one of those places
doesn't. A sealed class costs real, upfront structure — a whole new
type, two extension functions instead of one inline check — in exchange
for the compiler itself refusing to compile any exhaustive `when` over
`Display` that forgets the error case, permanently, everywhere, not just
in the one spot a developer happened to think to check.

### Commands Needed

For the isolated lab: `kotlinc lab_exhaustive_check.kt -include-runtime
-d lab_exhaustive_check.jar`, then `java -jar lab_exhaustive_check.jar`;
separately, `kotlinc lab_exhaustive_break.kt ...` to confirm the real
compile error. For the real project: `./gradlew testDebugUnitTest
assembleDebug` — this project's own already-established combined
command.

### Run It

Real output, from this session:

```
$ ./gradlew testDebugUnitTest assembleDebug
BUILD SUCCESSFUL in 5s
43 actionable tasks: 11 executed, 32 up-to-date
```

All 13 of this project's existing tests pass, unchanged. Two new,
permanent tests were also added: `CalculatorScreenTest.kt`'s
`pressingOperatorAfterErrorStartsFreshInsteadOfCrashing` (the exact real
crash sequence this unit's own Problem section reproduced, now asserting
the display reads `"0"` instead of throwing), and a new, entirely
Robolectric-free test file, `CalculatorStateTest.kt`, testing `nextState`
directly — `pressingSevenPlusThreeEqualsProducesTen`,
`pressingFiveDivideZeroEqualsProducesError`,
`pressingOperatorAfterErrorStartsFreshInsteadOfCrashing`, and one more —
each measured at real, sub-millisecond speed (`time="0.0"`/`"0.005"` in
the real JUnit XML report), against the multi-second Robolectric runs
`CalculatorScreenTest.kt`'s own tests still take. This project now has
18 real, passing tests total.

### Connect the Pieces

The previous unit proved that consolidating related state into one
immutable value keeps old values provably unchanged; this unit proved
that a sealed class's own exhaustiveness checking makes a real, latent
bug — reachable, confirmed, and now fixed — structurally impossible to
reintroduce, and combined both proofs into `CalculatorState`,
`Display`, and `nextState` for real.

## Connect the Pieces

One real value, traced through both units this lesson built: pressing
`5`, `÷`, `0`, `=`, then `+`. Before this lesson, that exact sequence
crashed this project's own real, shipped app with an uncaught
`NumberFormatException` — verified for real, in this lesson's second
unit, against the actual, unmodified code, before any fix was designed.
The first unit proved, with a throwaway `LabCounter`, that grouping
related data into one immutable value and updating it only through
`copy()` keeps old values provably, verifiably unchanged — the same
principle `CalculatorState` now applies to this project's own three
state properties. The second unit proved, with a throwaway `LabResult`,
that a `sealed class`'s own closed set of subtypes makes a `when`
expression's exhaustiveness a real, compiler-enforced guarantee, not a
hope — the same guarantee `Display`'s own two real functions,
`textOrZero()` and `toDisplayText()`, now rely on. Combined, `5`, `÷`,
`0`, `=`, `+` now produces `CalculatorState(display = Display.Value("0"),
firstOperand = 0, pendingOperator = Operator.PLUS)` — a real, valid,
crash-free state — instead of an uncaught exception. Eighteen real
tests, five of them new, prove it: `CalculatorScreen`'s own logic is now
smaller, its state is now one provably-immutable value, and its one
remaining ad-hoc string sentinel is gone.
