# Lesson 0.6: A Blueprint and Its Real Things

**What you will build.** `Calculator.kt` gains a real `Calculator`
class — a blueprint bundling the calculator's running total together
with the operations that change it, replacing the loose top-level
`add`/`subtract`/`multiply`/`divide` functions and the separately-typed
`displayValue` this curriculum has carried since Lesson 0.1. The
transferable problem underneath the feature: what it means for data and
the functions that operate on that data to be bundled together into one
real thing, instead of sitting nearby each other as unrelated pieces
that happen to agree on how to cooperate.

**What you need to know first.** `Calculator.kt` as Lesson 0.5 left it:
`add`/`subtract`/`multiply`/`divide` as free functions, `operatorSymbol`
and the nullable `operandB` with its `?:` fallback, and the `when`
expression choosing which function to call. Also `fun`, `val`/`var`,
`Int`, and `println`, from Lessons 0.1–0.2.

**Terms used in this lesson**

- **program** — a finite sequence of instructions a computer executes
  in order. This lesson reorganizes which instructions belong to what,
  not the fact that they still run in sequence.
- **value** — a piece of data a program holds and operates on. This
  lesson's whole subject is a value (`displayValue`) that, for the
  first time, belongs to something rather than standing alone.
- **type** — a category determining what a value's data is and what
  operations are valid on it. This lesson introduces a new *source* of
  types: not just `Int`, `String`, and the others already established,
  but a type this lesson's own code defines for the first time.
- **`fun`** — the keyword beginning a function declaration, unchanged
  from Lesson 0.2. This lesson reuses it inside a new context — a
  function declared *inside* a class — given full treatment below as a
  **method**.
- **`val`** — the keyword declaring an immutable binding, given full
  treatment in Lesson 0.1. `calculator`, this lesson's one new top-level
  name, is declared this way — the *name* `calculator` never points at
  a different object, even while, as this lesson's whole point, the
  object it points at can change internally.
- **`var`** — the keyword declaring a mutable binding, given full
  treatment in Lesson 0.1. This lesson uses it in a new position —
  inside a class's own parameter list — given full treatment below as
  part of a **property**.
- **`Int`** — Kotlin's type for whole numbers, given full treatment in
  Lesson 0.1. `Calculator`'s own running total is still an `Int`,
  unchanged in kind, only in *where it lives*.
- **class** — a blueprint describing what data a certain kind of object
  will hold and what operations it supports, written once and reused
  every time a new object of that kind is created. It exists because a
  program is often not just built from free-floating functions and
  values but from *things* — a calculator, a bank account, a game
  character — each with its own data and its own rules for changing
  that data, and a class is how Kotlin lets a programmer describe one
  such kind of thing exactly once.
- **object (instance)** — one real, concrete thing built from a class's
  blueprint, existing while the program runs, with its own independent
  copy of whatever data the class describes. It exists as the
  distinction between the *description* of a kind of thing (the class)
  and an actual *one* of that kind that a program can hold, pass
  around, and change — the same distinction between a cookie cutter and
  an actual cookie.
- **property** — a value that belongs to a specific object, part of
  that object's own data rather than a free-standing `val`/`var`. It
  exists so an object's data travels *with* the object itself — reading
  or changing it always means reading or changing one specific object's
  own copy, never some value sitting separately that the object merely
  happens to be near.
- **primary constructor** — the parameter list written directly in a
  class's own declaration (`class Calculator(var displayValue: Int)`),
  stating what has to be supplied to create a new object of that class,
  and, when a parameter is marked `val`/`var`, simultaneously declaring
  it as a property. It exists so creating an object and declaring its
  starting data can be a single, compact piece of syntax, rather than
  two separate steps a programmer has to remember to keep in sync.
- **method** — a function declared inside a class, callable only on a
  specific object of that class, with direct access to that object's
  own properties. It exists so an object's *behavior* — what it can
  actually do, and how it changes its own data in response — lives in
  the same place its data does, rather than in a separate free function
  that has to be told, every time, which object's data to work on.
- **implicit receiver** — inside a method's own body, a bare property
  name (`displayValue`, not `someCalculator.displayValue`) refers to
  the property belonging to whichever specific object the method was
  actually called on, without that object needing to be named again.
  It exists because a method is only ever running *on* one particular
  object at a time — the one it was called on — so re-stating which
  object's property is meant, every single time, inside the method's
  own body, would be pure repetition of something the call site already
  established.

**Objects and methods used**

- **`Calculator`**
  - *What it is:* this lesson's own new class — the calculator's data
    (its running total) and its operations (the four arithmetic
    actions) bundled into one blueprint.
  - *Implementation:* `class Calculator(var displayValue: Int) { fun
    add(amount: Int) { displayValue = displayValue + amount } fun
    subtract(amount: Int) { displayValue = displayValue - amount } fun
    multiply(amount: Int) { displayValue = displayValue * amount } fun
    divide(amount: Int) { displayValue = displayValue / amount } }` —
    one property (`displayValue`, declared via the primary constructor)
    and four methods, each taking one `Int` parameter and updating
    `displayValue` in place.
  - *Its use:* replaces the separate top-level `displayValue` and the
    four free functions this curriculum has carried since Lessons
    0.1–0.2, bundling the calculator's state and behavior into one real
    thing `main` creates exactly one of.
  - *Type:* a class declaration, with a primary constructor.
  - *Responsibility:* hold one running total and provide the four
    operations that change it, each one keeping that total consistent
    with the operation just performed — nothing about parsing input,
    printing, or deciding which operation to run belongs to it.
  - *Depends on:* one `Int` argument at construction time, to give
    `displayValue` its starting value.
  - *Connects to:* constructed once in `main`, this lesson's own real
    project code; `main` calls its methods, chosen by the same `when`
    expression Lesson 0.3 built, and reads its `displayValue` property
    directly to print the final result.
  - *Shape:* the calculator's own domain logic — the same architectural
    role Lessons 0.2–0.5's free functions occupied, now organized as a
    class instead of scattered top-level declarations.

- **`Any.toString`**
  - *What it is:* the method every Kotlin object has, inherited from
    `Any` — the root of Kotlin's entire class hierarchy — that
    `println` calls internally to convert any object into text.
  - *Implementation:* real source, fetched this session from
    `kotlin-stdlib-sources.jar` (`jvmMain/kotlin/Any.kt`):
    ```kotlin
    /**
     * The root of the Kotlin class hierarchy. Every Kotlin class has [Any] as a superclass.
     */
    public actual open class Any {
        /**
         * Returns a string representation of the object.
         */
        public actual open fun toString(): String
    }
    ```
    No body here either — this file is marked
    `@file:kotlin.internal.JvmBuiltin`, meaning on the JVM specifically,
    Kotlin's `Any.toString()` maps directly onto a real Java method
    instead of compiling its own separate implementation: real source,
    fetched this session from the JDK's own bundled `src.zip`
    (`java.base/java/lang/Object.java`):
    ```java
    public String toString() {
        return getClass().getName() + "@" + Integer.toHexString(hashCode());
    }
    ```
    This is not a claim taken on faith — it's the actual, current JDK
    source, matching this lesson's own real, verified output exactly:
    the class's real name, an `@`, and a hexadecimal number.
  - *Its use:* this lesson's Concept Unit 1 calls it indirectly, by
    printing a bare `Calculator` object, to prove the object is real and
    has an identity — not to give `Calculator` a meaningful text
    representation (which it never receives in this lesson).
  - *Type:* an `open` instance method declared on `Any`, overridden with
    a real body by `java.lang.Object` on the JVM specifically.
  - *Responsibility:* produce *some* text representation for any
    object whatsoever, even one that never customized it — never
    "nothing" or an error, always a real string.
  - *Depends on:* the object it's called on; specifically, that
    object's real class name and its `hashCode()` (also declared on
    `Any`, not otherwise used by name in this lesson).
  - *Connects to:* called by `println`'s own general `Any?` overload
    whenever its argument isn't one of `println`'s specifically-typed
    overloads; this lesson's own `Calculator` never overrides it, so
    the inherited, JDK-real implementation quoted above is what
    actually runs.
  - *Shape:* a public standard-library contract every Kotlin object
    satisfies automatically, whether or not its own class does anything
    to earn it.

- **`main`**
  - *What it is:* the specially-recognized JVM entry point, proven real
    with `javap` in Lesson 0.1.
  - *Implementation:* unchanged in declaration; its body now creates
    and operates on one real `Calculator` object instead of calling
    free functions directly.
  - *Its use:* still the only reason the JVM knows where to start; now
    also the only place a `Calculator` object is ever created in this
    lesson's code.
  - *Type:* a free (top-level) function.
  - *Responsibility:* be the program's single entry point.
  - *Depends on:* nothing to be declared; to run, depends on the file
    being compiled to a `.class` the JVM can load.
  - *Connects to:* called by the JVM's launcher; constructs a
    `Calculator`, calls one of its methods depending on
    `operatorSymbol`, and reads its `displayValue` property to print
    the result.
  - *Shape:* the outermost public boundary of the whole program.

- **`println`**
  - *What it is:* the standard-library function writing text and a line
    break to standard output.
  - *Implementation:* real source, unchanged from Lesson 0.1
    (`jvmMain/kotlin/io/Console.kt`):
    ```kotlin
    /** Prints the given [message] and the line separator to the standard output stream. */
    @kotlin.internal.InlineOnly
    public actual inline fun println(message: Any?) {
        System.out.println(message)
    }
    ```
    This lesson's Concept Unit 1 call resolves to exactly this
    overload — a `Calculator` object is not `Int`, `Boolean`, or any of
    `println`'s other specifically-typed overloads.
  - *Its use:* still this lesson's only way to make anything visible,
    now including printing an object directly.
  - *Type:* a top-level `inline` function.
  - *Responsibility:* convert its one argument to text — by calling
    that argument's own `toString()`, given full treatment above, when
    no more specific overload applies — and write it, followed by a
    line separator, to standard output.
  - *Depends on:* exactly one argument, of any type.
  - *Connects to:* called from `main`; internally calls
    `System.out.println`, which, for a plain object argument, itself
    calls that object's `toString()`.
  - *Shape:* a public standard-library API surface, unchanged in role.

---

## Concept Unit: Classes and Objects

### The Problem

Since Lesson 0.1, `displayValue` has been a loose `val`/`var` sitting in
`main`, and `add`/`subtract`/`multiply`/`divide` have been free
functions declared nowhere near it, agreeing only by convention that
they all take and produce `Int`s related to a calculator. Nothing in
the code itself says these five things belong together — a reader has
to already know this is "a calculator" to see the connection. Given
that Lesson 0.2 already established that a function bundles a name with
a fixed set of instructions, what do you think it would take to bundle
several *related* functions, and the data they all operate on, into one
single, named thing? If you had to describe, in one sentence, the
difference between a blueprint for a calculator and one actual working
calculator built from it, what would that sentence say?

### Project Change

- **Reference Source** — no reference counterpart; from-scratch, per
  the BRD's "Create a Calculator class" practice item for this lesson.
- **Files affected** — modified: `Calculator.kt`.
- **Change type** — add (a new, empty class declaration, and two new
  lines inside `main`).
- **Location** — the class is added above the existing free functions;
  the new lines go inside `main`, immediately after
  `println("Calculator starting up")`.
- **Dependencies** — none beyond Lessons 0.1–0.5.

### The New Code

```kotlin
class Calculator
```

and, inside `main`:

```kotlin
val calculator = Calculator()
println(calculator)
```

### The Updated Project

```kotlin
1:  class Calculator  // ← new
2:
3:  fun add(a: Int, b: Int) = a + b
4:  fun subtract(a: Int, b: Int) = a - b
5:  fun multiply(a: Int, b: Int) = a * b
6:  fun divide(a: Int, b: Int) = a / b
7:
8:  fun main() {
9:      println("Calculator starting up")
10:     val calculator = Calculator()  // ← new
11:     println(calculator)             // ← new
12:     val operandA = 6
13:     val operandB: Int? = null
14:     val operatorSymbol = "+"
15:     val safeOperandB = operandB ?: 0
16:     val result = when (operatorSymbol) {
17:         "+" -> add(operandA, safeOperandB)
18:         "-" -> subtract(operandA, safeOperandB)
19:         "*" -> multiply(operandA, safeOperandB)
20:         "/" -> divide(operandA, safeOperandB)
21:         else -> 0
22:     }
23:     println(result)
24: }
```

A brand-new `Calculator` class now exists, empty for now, and `main`
creates one real object from it and prints that object directly — the
rest of the file, including the free functions this class will
eventually replace, is untouched.

### Introduce the Concept in Isolation

A disposable scratch file (`verification/0.6/lab1_empty_class.kt`),
declaring an unrelated class to confirm this is a general fact about
classes and objects, not something specific to a calculator:

```kotlin
class Greeter

fun main() {
    val greeter = Greeter()
    println(greeter)
}
```

Compiled and run this session:

```
$ kotlinc lab1_empty_class.kt -include-runtime -d lab1_empty_class.jar
$ java -jar lab1_empty_class.jar
```

Real output:

```
Greeter@6bc7c054
```

This is not empty text, not an error, and not the word `null` — it's a
real string containing the class's own name (`Greeter`) and a real
hexadecimal number, proving `greeter` is a genuine, distinct object
that exists while the program runs, not merely a name that happens to
refer to nothing. This is called a **class**: `class Greeter` is the
blueprint — it doesn't itself run or exist as a "thing" while the
program executes — and `Greeter()` builds one real **object**, an
**instance** of that blueprint, that does.

### Discard the Throwaway Example

`lab1_empty_class.kt` is scratch, recorded in the verification folder,
not part of the calculator project. What it proved — that `ClassName()`
builds a real, distinct object, provable by its own default text
representation — is what `Calculator()`, above, relies on and
demonstrates.

### Mechanical Walkthrough

Every distinct syntactic element in the New Code:

- **`class Calculator`** — the `class` keyword given full treatment in
  this lesson's Header, followed by `Calculator`, an identifier (a
  programmer-chosen name, the same concept given full treatment in
  Lesson 0.2) naming this new blueprint. No parentheses, no body — the
  minimal possible class declaration, describing a kind of object with
  no data and no behavior yet.
- **`val calculator = Calculator()`** — the same `val` keyword and `=`
  initializer already given full treatment, naming a new value. Note
  the deliberate naming convention: `Calculator`, capitalized, names the
  *class* (the blueprint); `calculator`, lowercase, names *this specific
  object* — the same capitalization distinction this curriculum will
  keep applying every time a class and a variable holding one of its
  objects appear near each other. `Calculator()` is a call to the
  class's own constructor — even an empty class like this one has one,
  implicitly, taking no arguments — which builds and returns one new
  `Calculator` object, an **object (instance)** given full treatment in
  this lesson's Header.
- **`println(calculator)`** — the same overloaded, `inline`,
  `System.out.println`-delegating function given full treatment in this
  lesson's Header. `calculator` is a `Calculator`, not one of
  `println`'s specifically-typed overloads, so this call resolves to
  the general `println(message: Any?)` overload, which calls
  `calculator`'s own `toString()` — given full treatment in this
  lesson's Header, including its real, verified JDK source — producing
  the `Greeter@6bc7c054`-shaped output proven above, adapted to
  `Calculator`'s own real class name.

### CS Lens

Bundling data and the operations that act on that data into one named
kind of thing, distinct from a blueprint for it and an actual instance
built from that blueprint, is one of the most consequential ideas in
all of software design — the foundation of what's usually called
object-oriented programming, a term this curriculum will use formally
starting now. Also recognized in: a architectural blueprint versus an
actual constructed building — many buildings from one blueprint, each
a real, physically distinct structure; a cookie cutter versus the
cookies it produces; a biological species versus one individual member
of it; a car's factory design versus any one specific car that rolled
off the line, each with its own VIN, its own mileage, its own dents.

### SE Lens

Every object built from `class Calculator` — even this lesson's empty
version — is guaranteed to have exactly the shape `Calculator`
describes, checked by the compiler the same way every other type this
curriculum has met is checked. The alternative, still fully available
in Kotlin, would be to keep everything as loose functions and values,
the way this curriculum did through Lesson 0.5 — no bundling, no
guaranteed shape, just a convention a reader has to trust. That
alternative isn't wrong; it's what every earlier lesson in this
curriculum actually did, successfully. The real tradeoff a class
introduces: real structure that the compiler enforces, in exchange for
a small amount of new ceremony (a class declaration, a constructor
call) — a cost this lesson's own next two units will show paying off
directly, once `Calculator` actually holds real data and real behavior
instead of being empty.

### Commands Needed

No new commands — the same `kotlinc ... -include-runtime -d ...` /
`java -jar ...` pair from Lesson 0.1.

### Run It

Real output, `Calculator.kt` at its current state (verified this
session as `step1_empty_calculator_class.kt`):

```
$ kotlinc Calculator.kt -include-runtime -d Calculator.jar
$ java -jar Calculator.jar
```

Real output:

```
Calculator starting up
Calculator@6bc7c054
6
```

### Connect

A real `Calculator` object now exists, proven distinct and real by its
own default text form. The next unit gives it something actually worth
having — its own data.

---

## Concept Unit: Properties and the Primary Constructor

### The Problem

`Calculator` currently holds no data at all — every object built from
it is identical and empty, which is why printing one only ever shows a
generic class name and an identity number. A real calculator needs its
own running total, and Lesson 0.1 already established that a loose
`val`/`var` can hold an `Int` — but a loose value doesn't *belong* to
any particular `Calculator` object; it just sits in `main`, hoping
nothing else in the program mixes it up with a different calculation.
Given that `Calculator()` already takes the form of a function call,
what do you think it would take to make that call accept an argument —
the way `add(2, 3)` from Lesson 0.2 accepts two — and have that
argument become part of the object being built, rather than just a
value used once and discarded? If two separate `Calculator` objects
were both built this way, each with its own starting number, would you
expect changing one object's running total to have any effect on the
other's?

### Project Change

- **Reference Source** — no reference counterpart; from-scratch, per
  the BRD's `Properties`/`Constructors` concepts for this lesson.
- **Files affected** — modified: `Calculator.kt`.
- **Change type** — replace (`class Calculator` gains a primary
  constructor) and replace (`main`'s construction call and its use of
  `operandA` are updated to use the new property instead).
- **Location** — the `class Calculator` line from Concept Unit 1, and
  the `val calculator = Calculator()` / `operandA` lines inside `main`.
- **Dependencies** — none beyond Concept Unit 1.

### The New Code

```kotlin
class Calculator(var displayValue: Int)
```

and, inside `main`:

```kotlin
val calculator = Calculator(6)
println(calculator.displayValue)
```

### The Updated Project

```kotlin
1:  class Calculator(var displayValue: Int)  // ← changed
2:
3:  fun add(a: Int, b: Int) = a + b
4:  fun subtract(a: Int, b: Int) = a - b
5:  fun multiply(a: Int, b: Int) = a * b
6:  fun divide(a: Int, b: Int) = a / b
7:
8:  fun main() {
9:      println("Calculator starting up")
10:     val calculator = Calculator(6)      // ← changed: was `Calculator()`
11:     println(calculator.displayValue)     // ← changed: was `println(calculator)`
12:     val operandB: Int? = null
13:     val operatorSymbol = "+"
14:     val safeOperandB = operandB ?: 0
15:     val result = when (operatorSymbol) {
16:         "+" -> add(calculator.displayValue, safeOperandB)   // ← changed: was operandA
17:         "-" -> subtract(calculator.displayValue, safeOperandB) // ← changed
18:         "*" -> multiply(calculator.displayValue, safeOperandB) // ← changed
19:         "/" -> divide(calculator.displayValue, safeOperandB)   // ← changed
20:         else -> 0
21:     }
22:     println(result)
23: }
```

`operandA`, Lesson 0.3's original standalone value, is gone — the
calculator's own `displayValue` property now plays that role directly,
read from the real object instead of a separate loose variable.

### Introduce the Concept in Isolation

A disposable scratch file (`verification/0.6/lab2_properties.kt`),
using a `Counter` instead of a `Calculator`, and — critically — creating
*two* separate objects, to prove each one holds its own independent
data rather than somehow sharing it:

```kotlin
class Counter(var count: Int)

fun main() {
    val counterA = Counter(5)
    val counterB = Counter(100)
    println(counterA.count)
    println(counterB.count)
    counterA.count = 6
    println(counterA.count)
    println(counterB.count)
}
```

Compiled and run this session:

```
$ kotlinc lab2_properties.kt -include-runtime -d lab2_properties.jar
$ java -jar lab2_properties.jar
```

Real output:

```
5
100
6
100
```

`counterA` and `counterB` started with different values (`5` and `100`,
each supplied to its own constructor call) and printed correctly, each
with its own — proving the constructor argument really does become
part of the specific object built. Then, after `counterA.count = 6`
changed only `counterA`'s own copy, `counterB.count` still printed
`100`, completely unaffected — proving each object's **property** is
genuinely its own, not a value shared between every object of the same
class. This is called a **primary constructor**: the `(var count:
Int)` written directly after `Counter`'s own name both declares what
must be supplied to build a `Counter` and, because it's marked `var`,
declares `count` as a real property in the same stroke.

### Discard the Throwaway Example

`lab2_properties.kt` is scratch, recorded in the verification folder,
not part of the calculator project. What it proved — that a primary
constructor's `var` parameter becomes a real, independent property per
object — is what `Calculator`'s own `displayValue`, above, relies on.

### Mechanical Walkthrough

Every distinct syntactic element in the New Code:

- **`class Calculator(var displayValue: Int)`** — `class` and
  `Calculator`, unchanged from Concept Unit 1; `(var displayValue:
  Int)`, the primary constructor given full treatment in this lesson's
  Header: `var`, the same mutable-binding keyword given full treatment
  in Lesson 0.1, here marking `displayValue` as a property rather than
  a plain constructor parameter that would otherwise be discarded once
  construction finished; `displayValue`, an identifier; `: Int`, a type
  annotation, the same syntax given full treatment in Lesson 0.1,
  stating this property holds a whole number.
- **`val calculator = Calculator(6)`** — the same `val`/`=` already
  given full treatment; `Calculator(6)` is a constructor call, the same
  kind given full treatment in Concept Unit 1, now supplying `6` as the
  one argument the primary constructor requires — `6` becomes the new
  object's own `displayValue`.
- **`println(calculator.displayValue)`** — the same overloaded,
  `inline`, `System.out.println`-delegating function given full
  treatment in this lesson's Header; `calculator.displayValue` reads
  the property directly off the specific object `calculator` refers
  to — a `.` followed by the property's name, the same dot-access
  syntax Lesson 0.4 already used to read `Map.Entry`'s `key`/`value`
  properties. Because `displayValue` is `Int`, this call resolves to
  `println`'s `Int` overload, not the general `Any?` one Concept Unit
  1's bare `println(calculator)` used.
- **`add(calculator.displayValue, safeOperandB)`** — the same kind of
  function call given full treatment in Lesson 0.2, now passing
  `calculator.displayValue` — the object's own property — in place of
  the standalone `operandA` Lesson 0.3 originally declared; the same
  substitution applied to `subtract`, `multiply`, and `divide`'s own
  branches of the `when` expression given full treatment in Lesson 0.3.

### CS Lens

Data that travels with the specific object it describes, rather than
being tracked separately and merely associated with that object by
convention, is exactly what makes independent, simultaneously-existing
instances of the same kind of thing possible at all. Also recognized
in: two people with the same name still being two distinct people,
each with their own separate birthdate, address, and history; two bank
accounts opened under the identical terms and interest rate still
holding two completely independent balances; two instances of the same
mobile app running on two different phones, each with its own separate
saved state; two cells in a spreadsheet using the identical formula
template still computing two independent results from their own inputs.

### SE Lens

Kotlin's primary constructor syntax — declaring a parameter and a
property in one piece of syntax, `var displayValue: Int` inside the
class's own parentheses — is deliberately more compact than the
alternative most other languages require: a separate parameter,
assigned by hand to a separately-declared field, inside an explicit
constructor body (`this.displayValue = displayValue`, familiar from
Java). The tradeoff: Kotlin's shorter form only works cleanly when a
constructor parameter's *entire* job is becoming a property unchanged —
the moment a constructor needs to validate, transform, or compute
something from its parameters before they become real properties, the
compact syntax stops being enough, and Kotlin allows an explicit `init`
block or a full constructor body to handle that case, a pattern this
curriculum has not yet needed and will introduce only once a real need
for it appears in a later lesson.

### Commands Needed

No new commands.

### Run It

Real output, `Calculator.kt` at its current state (verified this
session as `step2_calculator_property.kt`):

```
$ kotlinc Calculator.kt -include-runtime -d Calculator.jar
$ java -jar Calculator.jar
```

Real output:

```
Calculator starting up
6
6
```

The second line, `6`, is `calculator.displayValue` printed directly;
the third, also `6`, is `add(6, 0)` — unchanged in actual arithmetic
result from Lesson 0.5, only in where the `6` now comes from.

### Connect

`Calculator` now holds real, independent data. The last unit in this
lesson gives it real behavior — operations that belong to the object
itself, instead of free functions it merely gets handed to.

---

## Concept Unit: Methods

### The Problem

`add`, `subtract`, `multiply`, and `divide` still live outside
`Calculator` entirely — free functions that happen to take an `Int` and
produce an `Int`, with no real connection to the object whose
`displayValue` they're used alongside. Given that a **method**,
declared inside a class, has direct access to that object's own
properties without needing them passed in as arguments, what do you
think `add` would look like rewritten as a method on `Calculator`
instead of a free function taking two parameters? If a method can read
*and change* an object's own property directly, would you still expect
it to need a `return` value the way Lesson 0.2's free `add` did, or
could it simply update `displayValue` itself and hand nothing back at
all?

### Project Change

- **Reference Source** — no reference counterpart; from-scratch,
  completing the BRD's "Create a Calculator class" practice item.
- **Files affected** — modified: `Calculator.kt`.
- **Change type** — remove (the four free functions from Lesson 0.2)
  and add (four methods inside `Calculator`) and replace (`main`'s
  `when` expression becomes a `when` statement calling those methods).
- **Location** — `Calculator`'s own declaration gains a body; the four
  free functions below it are deleted; `main`'s `when` expression and
  final `println` are rewritten.
- **Dependencies** — none beyond Concept Units 1–2.

### The New Code

```kotlin
class Calculator(var displayValue: Int) {
    fun add(amount: Int) {
        displayValue = displayValue + amount
    }
    fun subtract(amount: Int) {
        displayValue = displayValue - amount
    }
    fun multiply(amount: Int) {
        displayValue = displayValue * amount
    }
    fun divide(amount: Int) {
        displayValue = displayValue / amount
    }
}
```

and, inside `main`:

```kotlin
when (operatorSymbol) {
    "+" -> calculator.add(safeOperandB)
    "-" -> calculator.subtract(safeOperandB)
    "*" -> calculator.multiply(safeOperandB)
    "/" -> calculator.divide(safeOperandB)
}
println(calculator.displayValue)
```

### The Updated Project

```kotlin
1:  class Calculator(var displayValue: Int) {  // ← changed: gained a body
2:      fun add(amount: Int) {                   // ← new
3:          displayValue = displayValue + amount   // ← new
4:      }                                           // ← new
5:      fun subtract(amount: Int) {                // ← new
6:          displayValue = displayValue - amount     // ← new
7:      }                                             // ← new
8:      fun multiply(amount: Int) {                 // ← new
9:          displayValue = displayValue * amount      // ← new
10:     }                                              // ← new
11:     fun divide(amount: Int) {                    // ← new
12:         displayValue = displayValue / amount       // ← new
13:     }                                               // ← new
14: }                                                    // ← new
15:
16: fun main() {
17:     println("Calculator starting up")
18:     val calculator = Calculator(6)
19:     val operandB: Int? = null
20:     val operatorSymbol = "+"
21:     val safeOperandB = operandB ?: 0
22:     when (operatorSymbol) {                       // ← changed: no longer `val result = when`
23:         "+" -> calculator.add(safeOperandB)          // ← changed: method call
24:         "-" -> calculator.subtract(safeOperandB)      // ← changed
25:         "*" -> calculator.multiply(safeOperandB)      // ← changed
26:         "/" -> calculator.divide(safeOperandB)        // ← changed
27:     }                                                  // ← changed: no `else` branch
28:     println(calculator.displayValue)                  // ← changed: was `println(result)`
29: }
```

The four free functions from Lesson 0.2, and the intermediate
`println(calculator.displayValue)` from Concept Unit 2, are gone —
their teaching job is done, and the calculator's real behavior now
lives inside `Calculator` itself, called once by `main` and read once
at the end.

### Introduce the Concept in Isolation

A disposable scratch file (`verification/0.6/lab3_methods.kt`), using a
`Counter` with two methods — one taking a parameter, one taking
none — dispatched through a `when` with no `else` branch, to check
whether that's actually legal here:

```kotlin
class Counter(var count: Int) {
    fun increment(amount: Int) {
        count = count + amount
    }
    fun reset() {
        count = 0
    }
}

fun main() {
    val counter = Counter(5)
    val action = "increment"
    when (action) {
        "increment" -> counter.increment(3)
        "reset" -> counter.reset()
    }
    println(counter.count)
}
```

Compiled and run this session:

```
$ kotlinc lab3_methods.kt -include-runtime -d lab3_methods.jar
$ java -jar lab3_methods.jar
```

Real output:

```
8
```

This compiled and ran without any `else` branch — a real difference
from Lesson 0.3's own `when`, whose real compiler error demanded one.
The reason: Lesson 0.3's `when` was assigned to a `val`, making it an
*expression* that has to produce a value for every possible input,
proven exhaustive or not. This `when` is used as a **statement** — run
purely for the effect of whichever branch's method call actually
happens — and a statement never has to produce a value at all, so there
is nothing for the compiler to demand coverage of. `8` is `5 + 3`,
confirming `counter.increment(3)` really did update `count` in place —
calling a **method** by name on a specific object, the same
`object.methodName(arguments)` shape a property read
(`calculator.displayValue`) already established for reading, now used
for actually doing something.

### Discard the Throwaway Example

`lab3_methods.kt` is scratch, recorded in the verification folder, not
part of the calculator project. What it proved — that a method can
mutate its own object's property directly, and that a `when` used as a
statement needs no `else` branch — is what `Calculator`'s own methods
and `main`'s own dispatch, above, rely on.

### Mechanical Walkthrough

Every distinct syntactic element in the New Code:

- **`fun add(amount: Int) { displayValue = displayValue + amount }`** —
  `fun`, given full treatment in this lesson's Header as the keyword
  beginning this **method** — a function declared inside `Calculator`'s
  own body, given the full method treatment in this lesson's Header:
  callable only on a `Calculator` object, with direct access to that
  object's own properties. `amount`, a parameter (full treatment given
  in Lesson 0.2), type-annotated `Int`. Inside the body, `displayValue`
  — appearing bare, with no object name in front of it — reads and then
  reassigns the **implicit receiver**'s own property, given full
  treatment in this lesson's Header: whichever specific `Calculator`
  object this method actually gets called on. `displayValue + amount`
  is the same kind of expression given full treatment in Lesson 0.1,
  calling the real `Int.plus` this curriculum proved in that same
  lesson; the `=` immediately after `displayValue` is the same
  reassignment operator given full treatment in Lesson 0.1's own `var`
  coverage, here reassigning a property instead of a plain local
  variable — legal because `displayValue` was declared `var`, not
  `val`, in `Calculator`'s own primary constructor.
- **`fun subtract(amount: Int) { ... }`**,
  **`fun multiply(amount: Int) { ... }`**,
  **`fun divide(amount: Int) { ... }`** — the identical shape as `add`
  above, each reappearing with the same full treatment, differing only
  in which real operator (`Int.minus`, `Int.times`, `Int.div` — each
  given full treatment across Lessons 0.1–0.2) combines `displayValue`
  with `amount`.
- **`when (operatorSymbol) { ... }`** — the same `when` keyword given
  full treatment in Lesson 0.3, iterating the identical four branches
  established there, each now calling a method (`calculator.add(...)`,
  and so on) instead of evaluating to a value; no `else` branch, per
  this unit's own isolated lab proving one isn't required for a `when`
  used as a statement.
- **`calculator.add(safeOperandB)`** — method-call syntax: `calculator`,
  the specific object this call runs on; `.`, the same dot-access
  syntax Concept Unit 2 already used for reading a property, here
  followed by a method name instead; `add(safeOperandB)`, the call
  itself, supplying `safeOperandB` — the Elvis-defaulted value given
  full treatment in Lesson 0.5 — as `add`'s one `amount` parameter.
  `subtract`, `multiply`, and `divide`'s own calls follow the identical
  shape.
- **`println(calculator.displayValue)`** — the same overloaded,
  `inline`, `System.out.println`-delegating function given full
  treatment in this lesson's Header, reading `calculator`'s own
  `displayValue` property — given full treatment in Concept Unit 2 —
  after whichever method actually ran has already updated it in place.

### CS Lens

An operation that reads and changes an object's own internal data,
callable only through that specific object, rather than a free
function that has to be handed the data to work on from outside, is
the behavioral half of the same idea Concept Unit 2 established for
data. Also recognized in: a car's own accelerator pedal, which only
ever changes *that specific car's* speed, never some other car's; a
thermostat's own "raise temperature" control, acting on the one room
it's wired to; a bank account's own `deposit`/`withdraw` operations,
each changing only that one account's own balance, never another
account's, even when called with the identical dollar amount; a video
game character's own `takeDamage` action, reducing only that
character's own health, not every character's.

### SE Lens

`add`'s new form as a method returns nothing (`Unit`, implicitly) and
mutates `displayValue` directly, replacing Lesson 0.2's version, which
returned a new `Int` and changed nothing. Both are legitimate designs —
the free-function version was arguably *simpler* to reason about, since
nothing about calling it could surprise a caller by silently changing
data elsewhere. The method version was chosen here specifically because
it matches what a real calculator actually *is*: a single running
display that buttons update in place, not a pure calculation whose
result the caller has to remember to store somewhere themselves. The
real cost of this design: because `add` now mutates instead of
returning, calling it purely to "see what the answer would be, without
committing to it" is no longer directly possible — a real limitation
this curriculum accepts here because it matches a real calculator's
actual behavior, not because mutation is unconditionally the better
choice; Lesson 0.2's pure, return-a-value style remains the right
default for code that doesn't need to model something with genuinely
changing state.

### Commands Needed

No new commands.

### Run It

Real output, `Calculator.kt`'s complete, final state for this lesson
(verified this session as `step3_calculator_methods.kt`):

```
$ kotlinc Calculator.kt -include-runtime -d Calculator.jar
$ java -jar Calculator.jar
```

Real output:

```
Calculator starting up
6
```

### Connect

`Calculator` now holds its own data and its own behavior together, with
`main` reduced to creating one object, telling it which operation to
perform, and reading its result. This is the last new concept this
lesson introduces.

---

## Connect the Pieces

Follow `calculator` through every unit this lesson built, using
`Calculator.kt`'s real final state:

1. `main` starts (the same real JVM entry point Lesson 0.1 proved with
   `javap`) and prints `Calculator starting up`.
2. `val calculator = Calculator(6)` runs (Concept Units 1–2): the
   primary constructor `(var displayValue: Int)` receives `6`, and a
   real, distinct object is built — proven, in Concept Unit 1's own
   lab, to be a genuine object with its own identity, not merely a name
   referring to nothing.
3. `operandB`, `operatorSymbol`, and `safeOperandB` are set up exactly
   as Lesson 0.5 left them — `operandB` still `null`, `safeOperandB`
   still falling back to `0` via the real `?:` operator that lesson
   proved.
4. `when (operatorSymbol)` matches `"+"` (Concept Unit 3) and runs
   `calculator.add(safeOperandB)` — a **method** call, given full
   treatment in this lesson's Header, reading and reassigning
   `calculator`'s own `displayValue` property directly: `displayValue =
   displayValue + amount`, using the real `Int.plus` this curriculum
   proved in Lesson 0.1, with `displayValue` at `6` and `amount`
   (`safeOperandB`) at `0`.
5. `displayValue` is now `6` — unchanged in value from before the call,
   because `0` was added, but changed in *how* it got there: mutated in
   place by a method belonging to the object itself, not computed fresh
   by a free function and reassigned from outside.
6. `println(calculator.displayValue)` prints `6` — reading the property
   directly off the one real object this lesson's `main` ever creates.

Two lines of real, verified terminal output — `Calculator starting up`
and `6` — are the complete, observable result of a calculator that is
now, for the first time in this curriculum, one real, bundled thing —
its data and its own operations together — rather than a value and
some functions that merely happened to agree about it. Lesson 0.7
picks this file back up to teach the calculator's four operations to
share one common shape, through an interface.
