# Lesson 1.6: Where the Screen Ends and the Math Begins

**What you will build** — a real, working calculator: pressing `7`, `+`,
`3`, `=` makes the display read `"10"`, computed by the same arithmetic
logic first built as a console program, now called from inside this
Android UI — the moment Slice 1 ships. The transferable problem this
lesson is actually about: where a screen's own code should stop, and a
separate, screen-independent piece of business logic should start —
and why keeping that boundary real, not just conceptual, makes the
business logic checkable in ways the screen alone never could be.

**What you need to know first** — `CalculatorScreen`'s existing digit,
clear, and event-handling logic (`mutableStateOf`/`remember`/`by`, the
`when` block inside each `Button`'s `onClick`); the console calculator's
own domain logic from earlier in Stage 0 (`fun interface Operation`,
`Addition`/`Subtraction`/`Multiplication`/`Division`, `Calculator(var
displayValue: Int)` with its `perform` method, `enum class Operator`);
nullable types (`Int?`) and the `?:`/`?.` operators, also from Stage 0.

## Terms used in this lesson

- **Separation of concerns** — an architectural principle: code that
  handles one kind of responsibility (here, describing and reacting to a
  screen) is kept structurally apart from code that handles a different
  kind (here, arithmetic), so each can be understood, changed, and
  checked without the other getting in the way. It exists because a
  single file mixing both — UI code calling `setText`-style mutations
  interleaved with arithmetic — makes it hard to know, later, whether a
  bug lives in the math or in how the screen reacts to it; keeping them
  in genuinely separate files (Concept Unit 1, below) is what makes the
  boundary real, not just a naming convention.
- **Map's key-lookup operator (`somemap[key]`)** — the indexing operator
  on a `Map`, translating to a real call to `Map.get(key)`, returning a
  nullable `V?` rather than `V` — unlike a `List`'s own `[]`, which
  throws if the index is out of bounds, a `Map` simply has no way to
  guarantee the requested key exists, so its `[]` returns `null` instead
  of crashing when the key is missing. It exists so looking up a value by
  key reads exactly like looking up a value by position (the same `[]`
  syntax `List` already uses), while still being honest, in the type
  system itself, that the key might not be there.
- **`in` (Map membership check)** — an operator checking whether a given
  key exists in a `Map` at all, returning a plain `Boolean`, independent
  of what value (if any) that key maps to. It exists to let code check
  "does this key exist" without first performing a lookup and comparing
  the result to `null` by hand.
- **Smart cast** — the Kotlin compiler's own ability to treat a nullable
  value as non-null, automatically, inside a code block where it has
  already proven — through an explicit `!= null` check — that the value
  cannot be `null` there. It exists so a value already checked for `null`
  doesn't need a second, redundant not-null assertion (`!!`) or safe-call
  (`?.`) immediately afterward; the compiler itself tracks the proof.

## Objects and methods used

**`Operation`**
- What it is: an interface describing one thing — combining a running
  value with a new amount to produce a new running value.
- Implementation: `fun interface Operation { fun apply(current: Int,
  amount: Int): Int }` — a functional interface (SAM conversion already
  established), letting any matching lambda satisfy it directly.
- Its use: the shared shape every one of this project's four real
  arithmetic operations implements.
- Type: a functional interface with one abstract method.
- Responsibility: describes the one operation any real arithmetic
  strategy this project supports must be able to perform.
- Depends on: nothing — a pure contract.
- Connects to: implemented by `Addition`/`Subtraction`/`Multiplication`/
  `Division`, below; called by `Calculator.perform`.
- Shape: the polymorphic seam this project's whole arithmetic system is
  built on.

**`Addition`**
- What it is: the real implementation of `Operation` for `+`.
- Implementation: `class Addition : Operation { override fun
  apply(current: Int, amount: Int): Int { return current + amount } }`.
- Its use: the real behavior behind `Operator.PLUS`.
- Type: a class implementing `Operation`.
- Responsibility: computes `current + amount`, nothing else.
- Depends on: two real `Int` values, supplied by its caller.
- Connects to: instantiated once, held by `Operator.PLUS`; called by
  `Calculator.perform`.
- Shape: one of four interchangeable strategies behind `Operation`'s own
  shared shape.

**`Subtraction`**
- What it is: the real implementation of `Operation` for `-`.
- Implementation: `class Subtraction : Operation { override fun
  apply(current: Int, amount: Int): Int { return current - amount } }`.
- Its use: the real behavior behind `Operator.MINUS`.
- Type: a class implementing `Operation`.
- Responsibility: computes `current - amount`, nothing else.
- Depends on: two real `Int` values, supplied by its caller.
- Connects to: instantiated once, held by `Operator.MINUS`; called by
  `Calculator.perform`.
- Shape: one of four interchangeable strategies behind `Operation`'s own
  shared shape.

**`Multiplication`**
- What it is: the real implementation of `Operation` for `×`.
- Implementation: `class Multiplication : Operation { override fun
  apply(current: Int, amount: Int): Int { return current * amount } }`.
- Its use: the real behavior behind `Operator.TIMES`.
- Type: a class implementing `Operation`.
- Responsibility: computes `current * amount`, nothing else.
- Depends on: two real `Int` values, supplied by its caller.
- Connects to: instantiated once, held by `Operator.TIMES`; called by
  `Calculator.perform`.
- Shape: one of four interchangeable strategies behind `Operation`'s own
  shared shape.

**`Division`**
- What it is: the real implementation of `Operation` for `÷`.
- Implementation: `class Division : Operation { override fun
  apply(current: Int, amount: Int): Int { return current / amount } }`.
- Its use: the real behavior behind `Operator.DIVIDE`.
- Type: a class implementing `Operation`.
- Responsibility: computes `current / amount`, nothing else — carried
  over unchanged, including its own open, previously-flagged gap: `Int`
  division by a real `0` amount throws a real `ArithmeticException` at
  runtime, still deliberately unhandled here, still deferred to a later
  lesson on error handling.
- Depends on: two real `Int` values, supplied by its caller.
- Connects to: instantiated once, held by `Operator.DIVIDE`; called by
  `Calculator.perform`.
- Shape: one of four interchangeable strategies behind `Operation`'s own
  shared shape.

**`Calculator`**
- What it is: a class holding one running `Int` value and one method to
  update it by applying an `Operation`.
- Implementation: `class Calculator(var displayValue: Int) { fun
  perform(operation: Operation, amount: Int) { displayValue =
  operation.apply(displayValue, amount) } }`.
- Its use: instantiated fresh, in this lesson's own real project code,
  every time `=` is pressed with a real pending operation — carrying the
  first operand as its own starting `displayValue`.
- Type: a class with one mutable property and one method.
- Responsibility: holds a running numeric value and updates it, in
  place, by delegating the actual arithmetic to whatever `Operation` it's
  given.
- Depends on: a starting `Int` (its constructor argument) and, per call
  to `perform`, a real `Operation` and a real `Int` amount.
- Connects to: this lesson's own `CalculatorScreen` creates one, calls
  `perform` on it once, then reads its own `displayValue` back out.
- Shape: the one piece of real, mutating state this project's business
  logic owns — deliberately not a pure function, a carried-over Slice-0
  design choice a later lesson on pure functions is responsible for
  revisiting.

**`Operator`**
- What it is: an enum naming this project's four real arithmetic
  operations, each carrying its own real `Operation` implementation.
- Implementation: `enum class Operator(val operation: Operation) {
  PLUS(Addition()), MINUS(Subtraction()), TIMES(Multiplication()),
  DIVIDE(Division()) }`.
- Its use: `operatorSymbols` (this lesson's own new project code, below)
  maps each keypad symbol to exactly one of these four real constants.
- Type: an enum class, each constant carrying a real, distinct
  `Operation` value.
- Responsibility: gives each of the four real operations a fixed, named
  identity, and bundles it with the real `Operation` object that actually
  performs it.
- Depends on: nothing new — each constant's own `Operation` already
  exists by the time `Operator` itself is loaded.
- Connects to: read by `operatorSymbols`'s own values; each constant's
  own `.operation` property is what `Calculator.perform` is actually
  given.
- Shape: the real, closed set of arithmetic choices this project
  supports — adding a fifth would mean adding both a new `Operation`
  implementation and a new `Operator` constant.

**`mapOf(...)`**
- What it is: the standard-library function that builds an immutable
  `Map` from the key-value pairs passed to it.
- Implementation: `fun <K, V> mapOf(vararg pairs: Pair<K, V>): Map<K,
  V>`, from Kotlin's own standard library; each `"key" to value`
  expression (`to`, an already-established infix function) builds one
  real `Pair`.
- Its use: builds `operatorSymbols`, mapping each of the four operator
  keypad labels to its own real `Operator` constant.
- Type: a top-level generic function.
- Responsibility: takes a fixed sequence of key-value pairs and returns
  a real, immutable `Map` holding exactly those associations.
- Depends on: the pairs passed to it — here, four `String`-to-`Operator`
  pairs.
- Connects to: called once, to build `operatorSymbols`; its result is
  read by both the `[]` operator and the `in` check this lesson's Terms
  section already names.
- Shape: a standard-library factory function, the direct `Map` sibling of
  `listOf`, already used elsewhere in this project for `keypadRows`.

**`String.toInt()`**
- What it is: a standard-library function that parses a `String` into a
  real `Int`.
- Implementation: `fun String.toInt(): Int`, from Kotlin's own standard
  library — throws a real `NumberFormatException` if the string isn't a
  valid integer.
- Its use: converts `displayText` (a `String`, since it's built up one
  typed character at a time) into the real `Int` `Calculator` and
  `Operation` actually operate on.
- Type: an extension function on `String`.
- Responsibility: parses a string's own real digit characters into the
  numeric value they represent, or fails loudly if they don't represent
  one.
- Depends on: a `String` that's actually a valid integer — guaranteed
  here by construction, since `displayText` is only ever built from
  digit characters or set to a literal `"0"`.
- Connects to: called on `displayText`, both when stashing the first
  operand and when reading the second, immediately before each is handed
  to `Calculator`.
- Shape: the real boundary-crossing point between this project's
  UI-facing `String` state and its business logic's own `Int`-typed
  world.

**`Int.toString()`**
- What it is: converts a real `Int` back into its own decimal `String`
  representation.
- Implementation: inherited from `Any.toString()`, `Int` overriding it
  to produce the number's own real decimal digits.
- Its use: converts `calculator.displayValue` (an `Int`, the result of a
  real computation) back into the `String` `displayText` — and therefore
  `Text` — actually needs.
- Type: an instance method, inherited and overridden.
- Responsibility: produces a real, human-readable decimal string for
  whatever `Int` value it's called on.
- Depends on: nothing beyond the `Int` it's called on.
- Connects to: called on `calculator.displayValue`, immediately after
  `perform` runs; its result is assigned directly to `displayText`.
- Shape: the return trip across the same boundary `String.toInt()`
  crosses outward — business logic's own `Int` world, back to the UI's
  own `String` world.

---

## Concept Unit 1: Separation of Concerns — Porting the Domain Logic In

### The Problem

`CalculatorScreen`'s own `MainActivity.kt` has no arithmetic in it at
all — every digit, `C`, and the display itself only ever manipulate a
`String`. The console calculator's own real arithmetic — `Operation`,
`Calculator`, `Operator` — exists, fully built and already proven, but
has never been part of this Android project; nothing in
`AndroidCalculator/` has ever referenced it.

> **Try it yourself first:** `MainActivity.kt` already holds more than
> one real declaration side by side (`MainActivity` itself, `keypadRows`,
> `CalculatorScreen`) — Kotlin was already established as not requiring
> one file per declaration. Given that, and given the console calculator's
> own logic (`Operation`, `Calculator`, `Operator`) was written to work
> entirely with plain `Int` values, with no dependency on Compose or any
> Android API at all, what real obstacle — if any — would you predict
> stands between that code and this Android project, once it's placed in
> the same package? And: if that logic were instead pasted directly
> inside `MainActivity.kt`, alongside `CalculatorScreen`, what would that
> cost a reader trying to find, and understand, just the arithmetic?

### No new isolated lab for this unit

Porting an already-fully-proven set of classes into a new file is a
project-structure concept, not a new language construct — like an
earlier lesson's own Gradle-configuration units, there is no meaningful
throwaway lab separate from the real project's own files; this is
verified directly by a real compile of the real, newly-created file.

### Project Change

- **Reference Source:** the console calculator's own final, real,
  compiled state, `verification/0.10/step4_also_calculation.kt`
  (`Operation`/`Addition`/`Subtraction`/`Multiplication`/`Division`/
  `Calculator`/`Operator` only — that file's own `Calculation`/
  `describe()`/`main()` were console-app-specific and are not ported).
- **Files affected:** `app/src/main/java/com/example/calculator/
  Calculator.kt` (created).
- **Change type:** add (a brand-new file).
- **Location:** a new file, sibling to `MainActivity.kt`, in the same
  package.
- **Dependencies:** none — this code was already dependency-free.

### The New Code

```kotlin
package com.example.calculator

fun interface Operation {
    fun apply(current: Int, amount: Int): Int
}

class Addition : Operation {
    override fun apply(current: Int, amount: Int): Int {
        return current + amount
    }
}

class Subtraction : Operation {
    override fun apply(current: Int, amount: Int): Int {
        return current - amount
    }
}

class Multiplication : Operation {
    override fun apply(current: Int, amount: Int): Int {
        return current * amount
    }
}

class Division : Operation {
    override fun apply(current: Int, amount: Int): Int {
        return current / amount
    }
}

class Calculator(var displayValue: Int) {
    fun perform(operation: Operation, amount: Int) {
        displayValue = operation.apply(displayValue, amount)
    }
}

enum class Operator(val operation: Operation) {
    PLUS(Addition()),
    MINUS(Subtraction()),
    TIMES(Multiplication()),
    DIVIDE(Division())
}
```

### The Updated Project

Skipped for this unit — the file above is entirely new, with nothing
existing yet for it to land inside; per this schema's own explicit skip
condition for a freestanding new structure.

### Mechanical walkthrough

- `package com.example.calculator` — the already-established package
  declaration, identical to `MainActivity.kt`'s own, which is exactly
  what makes every declaration below immediately usable from
  `MainActivity.kt` with no import needed at all.
- `fun interface Operation { fun apply(current: Int, amount: Int): Int }`
  — the already fully-explained `Operation` interface (this lesson's own
  Header entry), carried over unchanged.
- `class Addition : Operation { ... }`, `Subtraction`, `Multiplication`,
  `Division` — the four already fully-explained implementing classes
  (this lesson's own Header entries), each carried over unchanged.
- `class Calculator(var displayValue: Int) { ... }` — the already
  fully-explained `Calculator` class (this lesson's own Header entry),
  carried over unchanged.
- `enum class Operator(val operation: Operation) { ... }` — the already
  fully-explained `Operator` enum (this lesson's own Header entry),
  carried over unchanged.

### CS lens

Moving a self-contained piece of logic into its own file, with no
dependency on the code that will eventually call it, is a real, general
idea: **decoupling through physical separation**. Also recognized in: a
shared library extracted from an application that originally embedded
it, a microservice split out from a monolith along a real functional
boundary, and any "core" or "domain" package in a layered application
that deliberately imports nothing from its own UI layer, even though the
UI layer imports from it.

### SE lens

The alternative not chosen is exactly what this Concept Unit's own
Socratic prompt raised: pasting `Operation`/`Calculator`/`Operator`
directly inside `MainActivity.kt`. That would compile identically — Kotlin
genuinely doesn't require separate files — but would mix two real,
different concerns in one file: reading it to understand the arithmetic
would mean scrolling past `Composable` UI code with nothing to do with
math, and reading it to understand the UI would mean scrolling past
classes with nothing to do with Compose. A separate file costs nothing
functionally and makes the real boundary between "this project's UI" and
"this project's business logic" something a reader can see in the file
list itself, before opening either file.

### Run it

Shown above, in full: the real compile of the newly-created
`Calculator.kt`, inside the real project, with real exit `0`
(`verification/1.6/step1_calculator_ported.txt`).

### Connecting the pieces

The domain logic now lives inside `AndroidCalculator/`, real and
compiling, but nothing calls it yet. Concept Unit 2 designs the piece of
new state `CalculatorScreen` itself needs before it can call `Calculator`
correctly.

---

## Concept Unit 2: Modeling a Pending Operation

### The Problem

`Calculator.perform` needs a starting value, an `Operation`, and an
amount, all at once — but a real calculator UI receives them across
*three separate taps*, with an unpredictable gap between each: a digit
(or several), then an operator, then more digits, then `=`. Nothing in
`CalculatorScreen` currently remembers what happened on an earlier tap by
the time a later one arrives.

> **Try it yourself first:** `remember`/`mutableStateOf`/`by` were
> already established as the mechanism for a value that survives
> `CalculatorScreen`'s own repeated recomposition — proven, already, to
> work for `displayText` across many taps. Given that the *same*
> mechanism works for any type, not just `String`, what real, concrete
> pieces of information would need their own remembered state to bridge
> "an operator was tapped" and "`=` was tapped," later? And: since
> neither piece of information exists yet when the screen first appears
> (no operator has been tapped), what does that suggest about the
> real type each one needs — plain `Int`/`Operator`, or something else?

### Introduce the concept in isolation

```kotlin
@Composable
fun LabPendingOperation() {
    var firstOperand by remember { mutableStateOf<Int?>(null) }
    var pendingOperator by remember { mutableStateOf<Operator?>(null) }
    var resultText by remember { mutableStateOf("no operation yet") }

    Column {
        Text(text = resultText, modifier = Modifier.testTag("resultText"))
        Button(
            onClick = {
                firstOperand = 7
                pendingOperator = Operator.PLUS
                resultText = "stashed 7 and +"
            },
            modifier = Modifier.testTag("stashButton")
        ) {
            Text(text = "stash")
        }
        Button(
            onClick = {
                val operator = pendingOperator
                val first = firstOperand
                if (operator != null && first != null) {
                    val calculator = Calculator(first)
                    calculator.perform(operator.operation, 3)
                    resultText = calculator.displayValue.toString()
                }
            },
            modifier = Modifier.testTag("combineButton")
        ) {
            Text(text = "combine")
        }
    }
}
```

Run for real — actually clicked, twice, in sequence, and checked after
each real click:

```
com.example.calculator.LabsCU16Test > stashThenCombineProducesRealResult PASSED

BUILD SUCCESSFUL in 4s
```

The real test found `resultText` reading `"no operation yet"`, clicked
`"stash"`, found it reading `"stashed 7 and +"` — proving `firstOperand`
and `pendingOperator` really did survive the recomposition that click
caused — then clicked `"combine"` and found it reading `"10"`: a real
`Calculator(7)` really was constructed, `Addition`'s own real `apply`
really ran, and the result really flowed back into the UI. Two separate,
real taps, correctly bridged by remembered state, calling real business
logic on the second tap using information captured on the first.

Discarded: `LabPendingOperation` above does not appear in the real
project; `CalculatorScreen`'s own real use, in Concept Units 3–4, wires
this same pattern to the keypad's actual operator and `=` buttons.

### No project change for this unit

This Concept Unit's own real code is entirely the isolated lab above;
`CalculatorScreen` itself is not yet modified — Concept Unit 3 is where
this same pattern lands in the real project, per this schema's own
allowance for a unit whose real verification is its own isolated
example.

### Mechanical walkthrough

- `var firstOperand by remember { mutableStateOf<Int?>(null) }` — the
  already fully-explained `remember`/`mutableStateOf`/`by` combination,
  now with an explicit type argument, `Int?` (already-established
  nullable-type syntax), and an initial value of `null` — `Int?`
  specifically because, at the moment `CalculatorScreen` first composes,
  no operand has been stashed yet, and no real `Int` value could
  honestly stand in for "nothing yet."
- `var pendingOperator by remember { mutableStateOf<Operator?>(null) }`
  — the identical pattern, holding a nullable `Operator?` instead.
- `val operator = pendingOperator` and `val first = firstOperand` — two
  ordinary `val` declarations (already-established syntax), reading each
  nullable state's current value into a local variable.
- `if (operator != null && first != null)` — an already-established `if`
  condition using the already-established `&&` operator; because both
  checks pass before the block's body runs, the compiler applies a
  **smart cast** (this lesson's own Terms entry) to `operator` and
  `first` inside the block — each is treated as non-null there, with no
  further `!!` or `?.` needed.
- `Calculator(first)` — a real constructor call to the already
  fully-explained `Calculator` class, using `first`'s own smart-cast,
  non-null `Int` value directly.
- `calculator.perform(operator.operation, 3)` — a real call to the
  already fully-explained `perform` method; `operator.operation` reads
  the already fully-explained `Operator` enum's own carried `Operation`
  property, using `operator`'s own smart-cast value.
- `calculator.displayValue.toString()` — the already fully-explained
  `Int.toString()` call, converting the real computed result back to a
  `String` for `resultText`.

### CS lens

Bridging several separate, time-ordered events by holding onto
information from an earlier one until a later one needs it is a real,
general idea: **stateful accumulation across events**. Also recognized
in: a parser holding onto a partially-built token across several
characters, a network protocol's own handshake (information exchanged in
an early step used to validate a later one), and a form wizard
remembering an earlier step's answers so a later step can use them,
without a single event ever carrying all the needed information at once.

### SE lens

The alternative not chosen is calling `Calculator.perform` the moment an
operator is tapped, using whatever the second operand happens to be at
that instant (likely still `"0"`, since it hasn't been typed yet) — which
would silently compute the wrong answer rather than correctly waiting.
Modeling the wait explicitly, as real, nullable state, makes "an
operation is pending but not yet ready to run" a real, checkable
condition in the code itself (`operator != null && first != null`),
rather than an implicit assumption about timing that happens to work
only if button presses arrive in exactly the expected order.

### Run it

Shown above, in full: the real, executed, passing test
(`verification/1.6/lab1_pending_operation_isolated.txt`).

### Connecting the pieces

The pattern bridging two separate taps into one real calculation is now
proven, in isolation, against the real `Calculator`/`Operator` classes.
Concept Unit 3 wires the first half — stashing — into
`CalculatorScreen`'s own real operator buttons.

---

## Concept Unit 3: Wiring the Operator Buttons

### The Problem

`CalculatorScreen`'s own `when` block has two real branches (digits,
`C`) and falls through silently for everything else — including `÷`,
`×`, `−`, and `+`. Each of those needs to do exactly what Concept Unit
2's isolated lab already proved: capture the current display as a real
`Int`, remember which operation was chosen, and reset the display for
the next operand.

> **Try it yourself first:** each operator symbol (`"÷"`, `"×"`, `"−"`,
> `"+"`) needs to map to exactly one real `Operator` constant
> (`DIVIDE`, `TIMES`, `MINUS`, `PLUS`) — a fixed, one-to-one association,
> the same shape `keypadRows` itself already needed for "which labels go
> in which row," just between two different kinds of value this time.
> Given `mapOf(...)` was just introduced as building exactly this kind of
> association, and given a `Map`'s own key-lookup can genuinely fail
> (this lesson's own Terms entry), what real check would need to happen
> before trusting whatever `operatorSymbols[label]` returns? And: this
> `when` block already has two real branches (digits, `"C"`) checked in
> order before falling through — where would a new branch for operator
> symbols need to sit relative to those two, given that a digit and an
> operator symbol never share the same label?

### No new isolated lab for this unit

This Concept Unit's own new construct — `mapOf`, the `in` check, and
`[]` lookup — is used identically to how any `Map` in Kotlin already
works, with real behavior already proven by this lesson's own Header
evidence; the real verification for this unit is the actual project
change itself, next.

### Project Change

- **Reference Source:** No reference counterpart — original addition.
- **Files affected:** `app/src/main/java/com/example/calculator/
  MainActivity.kt` (modified).
- **Change type:** add (a new top-level `Map`, two new `remember`ed
  state properties, and a third `when` branch).
- **Location:** `operatorSymbols` added alongside `keypadRows`; the two
  new state properties added directly after `displayText`'s own
  declaration; the new branch added inside the existing `when` block,
  after the `"C"` branch.
- **Dependencies:** none beyond what earlier lessons already resolved.

### The New Code

```kotlin
private val operatorSymbols = mapOf(
    "+" to Operator.PLUS,
    "−" to Operator.MINUS,
    "×" to Operator.TIMES,
    "÷" to Operator.DIVIDE
)
```

That lookup table alone does nothing until something actually reads it —
the second real piece of this Concept Unit's own change, a new branch
inside the existing `when` block:

```kotlin
label in operatorSymbols -> {
    firstOperand = displayText.toInt()
    pendingOperator = operatorSymbols[label]
    displayText = "0"
}
```

### The Updated Project

```kotlin
 1  @Composable
 2  fun CalculatorScreen() {
 3      var displayText by remember { mutableStateOf("0") }
 4      var firstOperand by remember { mutableStateOf<Int?>(null) }    // ← new
 5      var pendingOperator by remember { mutableStateOf<Operator?>(null) }  // ← new
 6      Column(
 7          modifier = Modifier.fillMaxWidth().padding(16.dp),
 8          verticalArrangement = Arrangement.spacedBy(8.dp),
 9          horizontalAlignment = Alignment.CenterHorizontally
10      ) {
11          Text(text = displayText, modifier = Modifier.testTag("display"))
12          for (row in keypadRows) {
13              Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
14                  for (label in row) {
15                      Button(
16                          onClick = {
17                              when {
18                                  label[0].isDigit() -> {
19                                      displayText = if (displayText == "0") label else displayText + label
20                                  }
21                                  label == "C" -> {
22                                      displayText = "0"
23                                  }
24                                  label in operatorSymbols -> {           // ← new
25                                      firstOperand = displayText.toInt()   // ← new
26                                      pendingOperator = operatorSymbols[label]  // ← new
27                                      displayText = "0"                    // ← new
28                                  }                                        // ← new
29                              }
30                          },
31                          modifier = Modifier.weight(1f)
32                      ) {
33                          Text(text = label)
34                      }
35                  }
36              }
37          }
38      }
39  }
```

Tapping `+`, `−`, `×`, or `÷` now captures the current display as a real
`Int` into `firstOperand`, remembers which `Operator` was chosen, and
resets the display to `"0"` — ready for the second operand to be typed
fresh, the same "replace, don't append, when starting from `0`" rule the
digit branch already relies on.

### Mechanical walkthrough

- `private val operatorSymbols = mapOf(...)` — a top-level property
  (already-established `private val` syntax), initialized by the already
  fully-explained `mapOf(...)` call.
- `"+" to Operator.PLUS`, and its three siblings — each a call to the
  already-established infix `to` function, building one real `Pair`
  associating a literal `String` with a real `Operator` constant.
- `label in operatorSymbols` — the `in` operator (this lesson's own
  Terms entry), checking whether `label` exists as a key in
  `operatorSymbols` at all, returning a plain `Boolean` — `true` for
  exactly the four operator symbols, `false` for every digit, `"C"`, and
  `"="`.
- `firstOperand = displayText.toInt()` — an assignment whose right-hand
  side is the already fully-explained `String.toInt()` call, parsing
  whatever `displayText` currently shows into a real `Int`.
- `pendingOperator = operatorSymbols[label]` — the Map key-lookup
  operator (this lesson's own Terms entry), reading `operatorSymbols`'s
  own real value for `label`; because this branch's own condition
  (`label in operatorSymbols`) already proved the key exists, this
  lookup is guaranteed, in practice, never to return `null` here — though
  its own real declared type remains `Operator?`, matching
  `pendingOperator`'s own declared type exactly.
- `displayText = "0"` — the already-established assignment, resetting
  the display for the next operand.

### CS lens

Using a lookup table to translate one small, fixed vocabulary (keypad
symbols) into another (enum constants), instead of a chain of manual
`if`/`else if` comparisons, is a real, general idea: **table-driven
dispatch**. Also recognized in: a compiler's own keyword table (mapping
source-text strings to real token types), a router mapping URL paths to
handler functions, and a state machine's own transition table, mapping
an (event, state) pair to whatever comes next.

### SE lens

The alternative not chosen is a `when` branch per operator symbol
(`label == "+" -> pendingOperator = Operator.PLUS`, repeated four times)
— which would work, but duplicates the same shape four times for
information that's genuinely just data (which symbol goes with which
constant), the same real argument that already justified this project's
own data-driven keypad generation. `operatorSymbols` keeps that
association in one place, read by name (`in`, `[]`) rather than compared
by hand — the real cost is the one honest gap this Concept Unit's own
Socratic prompt raised: a `Map` lookup can fail, and this code trusts
its own `in` check to have already ruled that out, rather than the type
system proving it structurally impossible.

### Run it

Shown above, in full: the real project build with operator buttons wired
(`verification/1.6/step2_operators_and_equals_wired.txt`).

### Connecting the pieces

Pressing an operator now correctly stashes a real first operand and a
real pending operator. Concept Unit 4 wires `=` — the moment those two
stashed values finally reach `Calculator.perform` for real.

---

## Concept Unit 4: Wiring `=` and Calling Into Business Logic

### The Problem

`firstOperand` and `pendingOperator` are now real and correctly
captured, but nothing reads them yet — `=` still falls through the same
`when` block doing nothing, and `Calculator.perform` has still never
been called from inside this Android project, anywhere.

> **Try it yourself first:** Concept Unit 2's own isolated lab already
> proved the exact real shape this branch needs — smart-cast both
> stashed values, construct a real `Calculator`, call `perform`, read the
> result back as a `String`. Given that, what's the one real difference
> between this branch and that lab's own `"combine"` button, given that
> the lab's own second operand was a fixed literal (`3`) and this
> project's own second operand is whatever `displayText` currently
> shows? And: once a result is computed and shown, should
> `firstOperand`/`pendingOperator` still hold their old values, or should
> pressing `=` a second time, with nothing new typed, do something
> different?

### No new isolated lab for this unit

This Concept Unit's own real code is Concept Unit 2's own already-proven
pattern, applied for real, with `displayText` (not a fixed literal) as
the second operand — no new construct to isolate; its real verification
is the actual project change, proven by a real, executed test, next.

### Project Change

- **Reference Source:** No reference counterpart — original addition.
- **Files affected:** `app/src/main/java/com/example/calculator/
  MainActivity.kt` (modified).
- **Change type:** add (a fourth `when` branch).
- **Location:** inside the existing `when` block, after the operator
  branch Concept Unit 3 added.
- **Dependencies:** none beyond what earlier Concept Units already
  resolved.

### The New Code

```kotlin
label == "=" -> {
    val operator = pendingOperator
    val first = firstOperand
    if (operator != null && first != null) {
        val calculator = Calculator(first)
        calculator.perform(operator.operation, displayText.toInt())
        displayText = calculator.displayValue.toString()
    }
    pendingOperator = null
    firstOperand = null
}
```

### The Updated Project

```kotlin
 1  onClick = {
 2      when {
 3          label[0].isDigit() -> {
 4              displayText = if (displayText == "0") label else displayText + label
 5          }
 6          label == "C" -> {
 7              displayText = "0"
 8          }
 9          label in operatorSymbols -> {
10              firstOperand = displayText.toInt()
11              pendingOperator = operatorSymbols[label]
12              displayText = "0"
13          }
14          label == "=" -> {                                          // ← new
15              val operator = pendingOperator                          // ← new
16              val first = firstOperand                                // ← new
17              if (operator != null && first != null) {                // ← new
18                  val calculator = Calculator(first)                  // ← new
19                  calculator.perform(operator.operation, displayText.toInt())  // ← new
20                  displayText = calculator.displayValue.toString()    // ← new
21              }                                                        // ← new
22              pendingOperator = null                                  // ← new
23              firstOperand = null                                     // ← new
24          }                                                            // ← new
25      }
26  },
```

Pressing `=` now reads both stashed values, and, only if both are real
(not `null` — guarding against `=` being pressed with no operator
pending, this lesson's own real, tested edge case), constructs a real
`Calculator` starting at the first operand, performs the real pending
operation against whatever the display currently shows as the second
operand, and writes the real result back to `displayText` — then clears
both stashed values either way, so a second, unrelated press of `=` does
nothing rather than silently repeating a stale computation.

### Mechanical walkthrough

- `label == "="` — the already-established `==` comparison, the fourth
  and final real condition in this `when` block.
- `val operator = pendingOperator` / `val first = firstOperand` — the
  identical already-explained read-into-local pattern from Concept Unit
  2's own isolated lab.
- `if (operator != null && first != null)` — the identical
  already-explained null-check, triggering the identical smart cast
  inside its own block.
- `Calculator(first)` — the already fully-explained constructor call,
  now using this project's own real, captured first operand instead of
  a fixed lab literal.
- `calculator.perform(operator.operation, displayText.toInt())` — the
  already fully-explained `perform` call; `displayText.toInt()` is the
  one real difference this Concept Unit's own Socratic prompt named:
  the second operand is read live, from whatever the display currently
  shows, not a fixed number.
- `displayText = calculator.displayValue.toString()` — the already
  fully-explained round trip back to `String`, now writing this
  project's own real, computed result to the real display.
- `pendingOperator = null` / `firstOperand = null` — two assignments
  (already-established syntax) resetting both stashed values back to
  their own original `null`, regardless of whether the `if` block above
  actually ran — answering this Concept Unit's own second Socratic
  question: a second, unrelated `=` press finds both values already
  `null` and does nothing, rather than reusing stale state.

### CS lens

Clearing accumulated state immediately after it's been consumed, so a
later, unrelated event can't accidentally reuse it, is a real, general
idea: **one-shot consumption**. Also recognized in: an HTTP
one-time-use token invalidated the moment it's redeemed, a message
queue's own "acknowledge and remove" semantics, and a Compose `Flow`'s
own single-shot event channel, specifically designed so a UI event fires
exactly once and can't be replayed by a later, unrelated recomposition.

### SE lens

The alternative not chosen is leaving `pendingOperator`/`firstOperand`
set after a successful `=`, allowing chained operations
(`7 + 3 = 10 + 5 = 15`) without retyping the operator. That's a real,
common calculator feature this lesson deliberately doesn't build —
clearing both values keeps this lesson's own scope to exactly what its
own BRD goal asks for (`7`, `+`, `3`, `=` showing `10`), an honest,
smaller feature set rather than a half-finished chaining
implementation with untested edge cases. Chained operations remain a
real, legitimate feature a later lesson could add, starting from this
exact, already-correct single-operation foundation.

### Run it

```kotlin
@Test
fun pressingSevenPlusThreeEqualsShowsTen() {
    composeTestRule.setContent {
        CalculatorScreen()
    }

    composeTestRule.onNodeWithText("7").performClick()
    composeTestRule.onNodeWithText("+").performClick()
    composeTestRule.onNodeWithTag("display").assertTextEquals("0")

    composeTestRule.onNodeWithText("3").performClick()
    composeTestRule.onNodeWithText("=").performClick()
    composeTestRule.onNodeWithTag("display").assertTextEquals("10")
}
```

Run for real, against the actual project:

```
com.example.calculator.CalculatorScreenTest > pressingSevenPlusThreeEqualsShowsTen PASSED

BUILD SUCCESSFUL in 4s
```

A real, executed proof — not a prediction — that `7`, `+`, `3`, `=`
produces `"10"`, computed by the real `Addition.apply` this lesson ported
in Concept Unit 1. The `=`-with-nothing-pending edge case was checked
too, for real:

```kotlin
@Test
fun pressingEqualsWithNoPendingOperatorDoesNothing() {
    composeTestRule.setContent {
        CalculatorScreen()
    }

    composeTestRule.onNodeWithText("7").performClick()
    composeTestRule.onNodeWithText("=").performClick()
    composeTestRule.onNodeWithTag("display").assertTextEquals("7")
}
```

Run for real, against the actual project, alongside every other test in
this same file:

```
com.example.calculator.CalculatorScreenTest > pressingEqualsWithNoPendingOperatorDoesNothing PASSED

BUILD SUCCESSFUL in 4s
```

Both saved at `verification/1.6/step3_full_arithmetic_test.txt` and
`verification/1.6/step5_equals_with_no_operator_safe.txt`.

### Connecting the pieces

Every button on this keypad now does something real. Concept Unit 5
steps back to show the concrete payoff of Concept Unit 1's own separate
file: a test of the arithmetic that needs none of this Concept Unit's
own UI machinery at all.

---

## Concept Unit 5: Keeping Logic Testable — A Test With No Screen At All

### The Problem

Every test this project has written so far — proving digits, `C`, and
now `=` all work — goes through `ComposeContentTestRule`, Robolectric's
own simulated Android environment, and a real, simulated tap. That's
real and valuable, but it's also real overhead: simulating an Android
environment, building a real Composition, dispatching a real click
event, just to check that `7 + 3` equals `10`.

> **Try it yourself first:** `Calculator`/`Operation`/`Operator` were
> just shown, in Concept Unit 1, to depend on nothing Android- or
> Compose-specific at all — plain classes, operating on plain `Int`
> values. Given that, and given every test this project has written uses
> JUnit's own `@Test` annotation already, regardless of whether
> Robolectric is involved, what would a test that constructs a
> `Calculator` and calls `perform` directly — with no `composeTestRule`,
> no `setContent`, no simulated click at all — need to import that the
> existing UI tests don't? And: what real, measurable difference would
> you predict in how long such a test takes to run, compared to a real
> Robolectric-based one?

### Introduce the concept in isolation

```kotlin
package com.example.calculator

import org.junit.Assert.assertEquals
import org.junit.Test

class CalculatorTest {

    @Test
    fun performAddsAmountToDisplayValue() {
        val calculator = Calculator(7)
        calculator.perform(Operator.PLUS.operation, 3)
        assertEquals(10, calculator.displayValue)
    }
}
```

Run for real:

```
com.example.calculator.CalculatorTest > performAddsAmountToDisplayValue PASSED, time=0.0s

BUILD SUCCESSFUL in 874ms
```

A real, measured `0.0` seconds for this one test's own execution — the
same real assertion this lesson's own UI test already made
(`pressingSevenPlusThreeEqualsShowsTen`), but with no Robolectric
runner, no simulated Android environment, and no simulated tap anywhere
in it, because `Calculator` itself never needed any of those things.
This is the concrete payoff of Concept Unit 1's own separation: business
logic that lives in its own file, depending on nothing UI-specific, can
be tested with nothing UI-specific either.

Discarded as a throwaway *demonstration*, but not as code: unlike this
lesson's other isolated labs, `CalculatorTest` is kept, permanently, as
this project's own first plain unit test file — a real, permanent
addition, not something written only to prove a point and then deleted.

### Project Change

- **Reference Source:** No reference counterpart — original addition.
- **Files affected:** `app/src/test/java/com/example/calculator/
  CalculatorTest.kt` (created).
- **Change type:** add (a brand-new test file).
- **Location:** a new file, in this project's own `test` source set —
  distinct from `androidTest`-style instrumented tests, and, unlike
  `CalculatorScreenTest.kt`, not using `RobolectricTestRunner` at all.
- **Dependencies:** `junit:junit:4.13.2`, already resolved.

### The Updated Project

Skipped — the file above is entirely new, with nothing existing yet to
show it landing inside, per this schema's own explicit skip condition.

### Mechanical walkthrough

- `import org.junit.Assert.assertEquals` — a new import, distinct from
  every assertion this project's own UI tests have used so far
  (`assertTextEquals`, specific to Compose's own testing API);
  `assertEquals` is JUnit's own plain, framework-independent assertion.
- `import org.junit.Test` — the already fully-explained `@Test`
  annotation, imported without also importing `RobolectricTestRunner` or
  `@RunWith` at all — this class needs no alternate test runner, since it
  never touches anything Robolectric exists to simulate.
- `class CalculatorTest` — an ordinary class (already-established
  syntax), with no annotations of its own beyond what its one test
  method carries.
- `val calculator = Calculator(7)` — the already fully-explained
  `Calculator` constructor call, direct, with no Compose or Android
  machinery anywhere around it.
- `calculator.perform(Operator.PLUS.operation, 3)` — the already
  fully-explained `perform` call, reading `Operator.PLUS`'s own carried
  `Operation` property directly.
- `assertEquals(10, calculator.displayValue)` — JUnit's own real
  assertion function, comparing the expected `Int` `10` against
  `calculator`'s own real, current `displayValue`, failing loudly with
  both values shown if they differ.

### CS lens

Testing a unit of logic in complete isolation from the larger system it
will eventually run inside is the real, general idea the term **unit
test** names literally. Also recognized in: testing a pure function with
a plain input/output check, testing a database query's own SQL logic
against an in-memory database instead of a real production one, and
testing a single microservice's own internal logic without spinning up
every other service it would eventually talk to in production.

### SE lens

The alternative not chosen is relying only on `CalculatorScreenTest.kt`'s
own UI-level tests to catch a real arithmetic bug. Those tests remain
genuinely necessary — they're the only ones proving the UI actually
calls the business logic correctly at all — but a bug purely inside
`Division.apply`, say, would be just as visible through either kind of
test, at very different cost: this lesson's own real, measured numbers
show a plain unit test finishing in a fraction of a second versus a
multi-second Robolectric-backed one. `Calculator.kt`'s own continued
mutable, side-effecting design (`perform` changing `displayValue` in
place, flagged honestly in this lesson's own Header) is exactly the kind
of thing a later lesson on pure functions is positioned to improve —
and when it does, this exact file, this exact test, already sitting
here with no Compose or Android dependency anywhere in its own import
list, is precisely what makes that improvement measurable.

### Run it

Shown above, in full: the real, executed, passing plain unit test
(`verification/1.6/step4_plain_unit_test_no_robolectric.txt`). The
complete project — every Concept Unit's own change together — was
confirmed once more with a full `./gradlew testDebugUnitTest
assembleDebug`: all five real tests across both test classes passing,
and a real, installable `.apk` produced
(`verification/1.6/step6_final_full_test_and_assembleDebug.txt`).

### Connecting the pieces

Every Concept Unit in this lesson comes together here: `Calculator.kt`,
ported in its own file (Concept Unit 1), called through state that
survives across separate taps (Concept Unit 2), fed by the operator
buttons (Concept Unit 3) and triggered by `=` (Concept Unit 4) — and now
provably testable on its own, with no screen involved at all, exactly
because it was kept separate from one from the start.

---

## Closing

**Connect the pieces.** Follow one concrete value — the number `10` —
through every unit this lesson built. It starts as `Calculator.kt`
itself (Concept Unit 1): a real, separate file, ported unchanged from
the console calculator, compiling with no dependency on anything this
lesson's own UI code does. Pressing `7` puts `"7"` on the display, using
logic from an earlier lesson; pressing `+` triggers Concept Unit 3's own
new branch — `firstOperand` becomes the real `Int` `7`, `pendingOperator`
becomes `Operator.PLUS`, both surviving recomposition exactly as Concept
Unit 2's own isolated lab already proved they would. Pressing `3` puts
`"3"` on the now-reset display. Pressing `=` triggers Concept Unit 4's
own branch: both stashed values smart-cast to non-null, a real
`Calculator(7)` constructed, `Addition.apply(7, 3)` actually running
inside it, producing the real `Int` `10`, converted back to the `String`
`"10"` and written to the display — the exact real result this lesson's
own passing test checked. And the reason any of that arithmetic could be
checked *twice* — once through a real simulated tap, once through
Concept Unit 5's own plain, fast unit test, with no screen involved at
all — is Concept Unit 1's own real, separate file, kept apart from this
project's UI from the very first line.

**🟢 Ship Slice 1 — a functioning Android basic calculator.** Every
digit, `C`, every operator, and `=` now does something real, verified by
five real, executed tests and a real, installable `.apk`. `Calculator.kt`'s
own carried-over gaps — `Division`'s unhandled `0` divisor, `perform`'s
own mutating, not-yet-pure design — are real, honest, open items, not
silently fixed here; they are exactly Stage 2's own stated business,
starting with Lesson 2.1, Pure Functions.
