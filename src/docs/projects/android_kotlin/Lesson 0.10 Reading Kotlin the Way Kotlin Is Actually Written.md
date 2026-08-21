# Lesson 0.10: Reading Kotlin the Way Kotlin Is Actually Written

**What you will build.** `Calculator.kt` gains its first extension
function, its first string templates, and three of Kotlin's four
standard **scope functions** — `let`, `apply`, and `also` — each
applied somewhere it genuinely improves the real code, plus a fourth,
`run`, explored in isolation. No new calculator feature ships this
lesson; the transferable problem underneath it is different: real
Kotlin code — in a tutorial, in an open-source library, in Stage 1's
own Android APIs — constantly uses syntax this curriculum has not yet
named, not because it's advanced, but because it's *idiomatic*: the
normal, expected way experienced Kotlin is actually written. This is
Slice 0's last lesson, and its own goal, stated directly in the BRD, is
this: read normal Kotlin without getting lost.

**What you need to know first.** `Calculator.kt` as Lesson 0.9 left
it: the `fun interface Operation`, `Addition`/`Subtraction`/
`Multiplication`/`Division` implementing it, `Calculator.perform`,
`Operator` (an enum carrying its own `Operation`), and `Calculation`
(a `data class`). Also `class`, properties, and the primary
constructor, from Lesson 0.6, and lambdas, from Lesson 0.9.

**Terms used in this lesson**

- **program** — a finite sequence of instructions a computer executes
  in order. This lesson makes existing instructions easier to read at a
  glance, not different in what they actually do.
- **value** — a piece of data a program holds and operates on. Every
  scope function this lesson introduces ultimately produces one — a
  receiver, or a block's own result — the same core idea given full
  treatment in Lesson 0.1.
- **type** — a category determining what a value's data is and what
  operations are valid on it. Nothing new about types themselves this
  lesson; every scope function's own real signature, shown throughout,
  is checked with the identical strictness this curriculum has proven
  since Lesson 0.1.
- **`class`** — a blueprint describing what data and behavior a kind of
  object has, given full treatment in Lesson 0.6. `Calculator` and
  `Counter` (this lesson's own throwaway example) are both declared
  this way, unchanged.
- **property** — a value belonging to a specific object, given full
  treatment in Lesson 0.6. Every scope function this lesson covers
  reads or sets real properties — `displayValue`, `count`, and others —
  the identical concept, just accessed through a new kind of block.
- **primary constructor** — the parameter list written directly in a
  class's own declaration, given full treatment in Lesson 0.6.
  `Calculator`'s own constructor is unchanged this lesson.
- **lambda expression** — a function written anonymously, inline, given
  full treatment in Lesson 0.9. Every scope function this lesson covers
  is, underneath, an ordinary higher-order function accepting a lambda
  — the same mechanism, applied to a genuinely common, recurring shape
  of problem rather than a one-off case.
- **`it`** — the automatic name Kotlin gives a lambda's own single
  parameter when no name is written explicitly. It exists so a
  single-parameter lambda — extremely common, especially with scope
  functions — doesn't need a parameter name declared and then used
  exactly once; `{ x -> println(x) }` and `{ println(it) }` are the
  identical lambda, just spelled two different ways.
- **extension function** — a function that adds new callable behavior
  to an existing type, written and compiled entirely separately from
  that type's own original declaration. It exists so a type a
  programmer doesn't own, or already-finished code a programmer
  doesn't want to reopen and edit, can still gain new, real,
  dot-callable methods — `5.squared()`, in this lesson's own isolated
  lab — without modifying `Int`'s own real declaration at all, which,
  for a built-in type like `Int`, isn't even possible.
- **string template** — a string literal containing `$name` or
  `${expression}`, evaluated and substituted into the resulting text
  automatically. It exists so building a string from several pieces of
  data doesn't require manually gluing literal text and values together
  with a separate concatenation operator, called repeatedly.
- **scope function** — one of a small, standard set of Kotlin functions
  (`let`, `apply`, `also`, `run`, and a fifth, `with`, not covered in
  this lesson) that runs a lambda "in the scope of" a receiver object —
  giving that lambda special, temporary access to the receiver, as
  either `this` or `it` — and returns either that same receiver or the
  lambda's own result, depending on which one is used. It exists to
  express a small number of extremely common patterns — configure this
  and hand it back; act on this value only if it's genuinely there;
  compute something from this receiver — in one direct expression,
  rather than several separate statements each doing part of the same
  job.

**Objects and methods used**

- **`Int.squared`**
  - *What it is:* this lesson's own throwaway extension function,
    adding a `squared()` method to `Int` for the sole purpose of
    proving extension functions are real and general.
  - *Implementation:* `fun Int.squared(): Int { return this * this }`.
  - *Its use:* isolated-lab only, proving the mechanism before
    `Calculation.describe` (below) applies it for real.
  - *Type:* an extension function on `Int`.
  - *Responsibility:* given the `Int` it's called on, return that
    value multiplied by itself.
  - *Depends on:* the `Int` value it's called on (available inside its
    own body as `this`); no other arguments.
  - *Connects to:* called with ordinary dot syntax, `5.squared()`, in
    this lesson's own isolated lab only — never part of
    `Calculator.kt`'s real project code.
  - *Shape:* a standalone, throwaway demonstration of the mechanism
    `Calculation.describe`, below, actually uses for real.

- **`Calculation.describe`**
  - *What it is:* this lesson's own new extension function — a
    human-readable summary of a completed calculation, added to the
    `Calculation` data class, given full treatment in Lesson 0.8,
    entirely from outside its own declaration.
  - *Implementation:* `fun Calculation.describe(): String { return
    "$operandA $operator $operandB = $result" }`.
  - *Its use:* replaces `Calculator.kt`'s previous
    `println(calculation)` (Lesson 0.8's own auto-generated
    `Calculation(operator=PLUS, operandA=6, operandB=0, result=6)`
    form) with a shorter, human-facing sentence.
  - *Type:* an extension function on `Calculation`.
  - *Responsibility:* produce one readable `String` summarizing a
    `Calculation`'s own four properties — nothing about constructing,
    validating, or storing a `Calculation` belongs to it.
  - *Depends on:* the `Calculation` object it's called on (available
    inside its own body as an **implicit receiver**, given full
    treatment in Lesson 0.6, the identical mechanism an ordinary
    method already uses).
  - *Connects to:* called on `calculation` inside `main`, this lesson's
    own real project code; reads all four of `Calculation`'s own
    properties, given full treatment in Lesson 0.8.
  - *Shape:* a public-surface convenience — presentation logic kept
    separate from `Calculation`'s own plain-data declaration, rather
    than added to `Calculation`'s own primary constructor body (which,
    per Lesson 0.8's own Header, `data class` doesn't have room for
    without abandoning its auto-generated members).

- **`Any.let`**
  - *What it is:* one of Kotlin's standard scope functions — runs a
    lambda with the receiver passed in as `it`, and returns whatever
    that lambda itself returns.
  - *Implementation:* declared, in real Kotlin source, as an inline
    extension function on every type (`Any?`, including nullable
    receivers): `public inline fun <T, R> T.let(block: (T) -> R): R`.
    Called as `receiver.let { ... }`.
  - *Its use:* `Calculator.kt`'s own `operandB?.let { ... }` runs its
    block only when `operandB` is genuinely non-null, printing a
    message using the safely-unwrapped value as `it`.
  - *Type:* a generic inline extension function.
  - *Responsibility:* run the given lambda exactly once, passing the
    receiver as its one argument, and return the lambda's own result.
  - *Depends on:* the receiver it's called on, and one lambda argument
    accepting that receiver's type.
  - *Connects to:* called via a safe call, `operandB?.let { ... }` —
    the safe call given full treatment in Lesson 0.5 is what actually
    skips `let` entirely when `operandB` is `null`; `let` itself has no
    special null-handling of its own.
  - *Shape:* a public standard-library API surface, most often paired
    with a safe call the way this lesson's own code pairs it.

- **`Any.apply`**
  - *What it is:* one of Kotlin's standard scope functions — runs a
    lambda with the receiver available as `this`, and returns that
    same receiver.
  - *Implementation:* declared as an inline extension function:
    `public inline fun <T> T.apply(block: T.() -> Unit): T`. Called as
    `receiver.apply { ... }`.
  - *Its use:* `Calculator.kt`'s own
    `Calculator(6).apply { println(...) }` builds a `Calculator`,
    immediately runs a block that can read its properties directly
    (no receiver name needed, per `this`, below), and hands the exact
    same `Calculator` object back to be assigned to `calculator`.
  - *Type:* a generic inline extension function.
  - *Responsibility:* run the given lambda exactly once, with the
    receiver as its implicit `this`, then return that unchanged
    receiver — never the lambda's own result.
  - *Depends on:* the receiver it's called on, and one lambda whose
    body runs with that receiver as `this`.
  - *Connects to:* called directly on the result of `Calculator(6)`,
    this lesson's own real project code; the value `apply` returns is
    what `val calculator` actually holds.
  - *Shape:* a public standard-library API surface, most often used
    immediately after constructing an object, the same way this
    lesson's own code uses it.

- **`Any.also`**
  - *What it is:* one of Kotlin's standard scope functions — runs a
    lambda with the receiver available as `it`, and returns that same
    receiver.
  - *Implementation:* declared as an inline extension function:
    `public inline fun <T> T.also(block: (T) -> Unit): T`. Called as
    `receiver.also { ... }`.
  - *Its use:* `Calculator.kt`'s own
    `Calculation(...).also { println("Recorded: ${it.describe()}") }`
    logs the finished calculation as a side effect, while `calculation`
    itself still ends up holding the exact, unmodified `Calculation`
    object `also` was called on.
  - *Type:* a generic inline extension function.
  - *Responsibility:* run the given lambda exactly once, passing the
    receiver as its one argument (`it`), then return that unchanged
    receiver — never the lambda's own result.
  - *Depends on:* the receiver it's called on, and one lambda argument
    accepting that receiver's type.
  - *Connects to:* called directly on a freshly-built `Calculation`
    object, this lesson's own real project code; calls
    `Calculation.describe`, given full treatment above, inside its own
    lambda.
  - *Shape:* a public standard-library API surface — nearly identical
    in real signature to `apply`, differing only in whether the
    receiver arrives as `this` or `it`, a distinction this lesson's own
    Concept Unit 4 addresses directly.

---

## Concept Unit: Extension Functions and String Templates

### The Problem

`Calculation`, since Lesson 0.8, prints as
`Calculation(operator=PLUS, operandA=6, operandB=0, result=6)` — its
own real, auto-generated `toString()`, accurate but not something a
person would naturally write by hand to describe a calculation. Adding
a nicer method directly to `Calculation`'s own declaration is one
option — but given that `data class`'s entire value, per Lesson 0.8,
comes from its compact, property-only primary constructor, what do you
think happens to that auto-generation the moment a hand-written method
body gets added inside its braces? Given that Lesson 0.6 already
established that a method lives inside the class it belongs to, what do
you think it would take to add a *new* method to `Calculation` — or
even to a type this curriculum doesn't own the source of, like `Int` —
entirely from *outside* its own declaration?

### Project Change

- **Reference Source** — no reference counterpart; from-scratch, per
  the BRD's "Extension functions" concept for this lesson.
- **Files affected** — modified: `Calculator.kt`.
- **Change type** — add (a new top-level function) and replace
  (`println(calculation)` becomes `println(calculation.describe())`).
- **Location** — the new function is added below `Calculation`'s own
  declaration; the replacement is inside `main`, on the final
  `println` call from Lesson 0.8.
- **Dependencies** — none beyond Lesson 0.8.

### The New Code

```kotlin
fun Calculation.describe(): String {
    return "$operandA $operator $operandB = $result"
}
```

and, inside `main`:

```kotlin
println(calculation.describe())
```

### The Updated Project

```kotlin
1: data class Calculation(val operator: Operator, val operandA: Int, val operandB: Int, val result: Int)
2:
3: fun Calculation.describe(): String {   // ← new
4:     return "$operandA $operator $operandB = $result"  // ← new
5: }                                        // ← new
```

and, inside `main` (the final line only; everything above it is
unchanged from Lesson 0.9):

```kotlin
1: ...
2: val calculation = Calculation(operatorChoice, operandA, safeOperandB, calculator.displayValue)
3: println(calculation.describe())  // ← changed: was `println(calculation)`
```

### Introduce the Concept in Isolation

Two disposable scratch files. First,
`verification/0.10/lab1a_extension_function.kt`, adding a method to
`Int` itself — a type this curriculum has never had the source code
of, proving extension functions genuinely don't require owning or
editing the original declaration:

```kotlin
fun Int.squared(): Int {
    return this * this
}

fun main() {
    println(5.squared())
}
```

Compiled and run this session:

```
$ kotlinc lab1a_extension_function.kt -include-runtime -d lab1a_extension_function.jar
$ java -jar lab1a_extension_function.jar
```

Real output:

```
25
```

`5.squared()` — ordinary dot-call syntax, given full treatment in
Lesson 0.6, on `Int`, a type built into Kotlin itself — really works,
even though `Int`'s own real declaration (`Primitives.kt`, quoted
across this curriculum since Lesson 0.1) was never touched. This is
called an **extension function**: `fun Int.squared()` reads as "add a
function named `squared`, callable on any `Int`," and inside its own
body, `this` refers to the specific `Int` the call happened on — `5`,
in this run — the same **implicit receiver** idea Lesson 0.6 proved
for an ordinary method, here made explicit because there's no
surrounding class body to make it implicit inside.

Second, `verification/0.10/lab1b_string_template.kt`, proving what
`"$operandA $operator $operandB = $result"` actually does:

```kotlin
fun main() {
    val name = "World"
    val count = 3
    println("Hello, $name! You have ${count + 1} messages.")
}
```

Compiled and run this session:

```
$ kotlinc lab1b_string_template.kt -include-runtime -d lab1b_string_template.jar
$ java -jar lab1b_string_template.jar
```

Real output:

```
Hello, World! You have 4 messages.
```

`$name` was replaced with `name`'s own real value (its `toString()`,
given full treatment in Lesson 0.6, since `name` is already a
`String` here); `${count + 1}` — a whole expression inside `${` `}` —
was evaluated first (`3 + 1 = 4`, the real `Int.plus` this curriculum
proved in Lesson 0.1), then its result substituted the same way. This
is called a **string template**: any `$name` or `${expression}` inside
a string literal is replaced, at that exact position, with the real
text of whatever it evaluates to, all in one literal, with no separate
concatenation operator needed anywhere.

### Discard the Throwaway Examples

`lab1a_extension_function.kt` and `lab1b_string_template.kt` are
scratch, recorded in the verification folder, not part of the
calculator project. What they proved — that a real extension function
can be added to a type from outside its declaration, and that a string
template substitutes real values directly into literal text — is what
`Calculation.describe`, above, relies on and combines.

### Mechanical Walkthrough

Every distinct syntactic element in the New Code:

- **`fun Calculation.describe(): String`** — `fun`, given full
  treatment in Lesson 0.2; `Calculation.`, immediately after `fun` and
  before the function's own name — an **extension function**, given
  full treatment in this lesson's Header, stating this function adds a
  new method to `Calculation`, given full treatment in Lesson 0.8, from
  outside its own declaration; `describe`, an identifier; empty
  parentheses, since this function needs no parameters beyond the
  receiver it's called on; `: String`, an explicit return type, the
  same syntax given full treatment in Lesson 0.2.
- **`return "$operandA $operator $operandB = $result"`** — `return`,
  given full treatment in Lesson 0.2; a string template, given full
  treatment in this lesson's Header: `$operandA`, `$operandB`, and
  `$result` each read one of `Calculation`'s own real properties,
  given full treatment in Lesson 0.8, accessible here bare — with no
  receiver name in front of them — because they belong to the same
  implicit receiver `this` refers to inside this extension function's
  own body, the identical mechanism Lesson 0.6 proved for an ordinary
  method's own properties; `$operator` reads the `Operator` enum
  constant given full treatment in Lesson 0.8, substituting its own
  default `toString()` (its declared name, `PLUS`, proven in Lesson
  0.8's own real output) directly into the resulting text.
- **`calculation.describe()`** — a call to this lesson's own new
  extension function, using the identical dot-call syntax given full
  treatment in Lesson 0.6 for an ordinary method — from the calling
  side, an extension function and an ordinary method are
  indistinguishable; the difference is only in where each one is
  allowed to be declared.
- **`println(calculation.describe())`** — the same overloaded,
  `inline`, `System.out.println`-delegating function given full
  treatment in Lesson 0.1; `calculation.describe()` evaluates to a
  `String`, resolving this call to `println`'s general `Any?` overload
  the same way a bare `String` literal already has, since Lesson 0.1.

### CS Lens

Adding real, callable behavior to a type without modifying — or even
having access to — that type's own original source is a genuinely
useful capability recurring across mature software ecosystems, not a
Kotlin-only trick. Also recognized in: C#'s own extension methods,
which directly inspired Kotlin's identical feature; a retrofitted
accessibility ramp added to an existing building, extending what the
building supports without altering its original architectural plans;
a smartphone case adding a kickstand or a card holder to a phone whose
own manufacturer never designed one in; a browser extension adding new
right-click menu options to a webpage the extension's author never
wrote a single line of.

### SE Lens

Kotlin could have required every useful method on `Calculation` to live
inside `Calculation`'s own declaration, the way Lesson 0.6 first taught
methods. That alternative would work here — `describe` could have been
written inside `Calculation`'s braces — but Lesson 0.8's own Header
already established that a `data class`'s entire compact form comes
from being *only* a primary constructor's worth of properties; adding
a hand-written method body works technically, but starts to blur why
`data class` was chosen at all, versus an ordinary class Lesson 0.6
already covers. Keeping `Calculation` itself as pure data, and adding
`describe` as a separate, later, extension function, keeps that
original design decision legible: `Calculation` is still exactly what
Lesson 0.8 said it was, and this lesson's own presentation-formatting
concern lives visibly separately from it, addable, in principle, by
code that doesn't even own `Calculation`'s own declaration at all.

### Commands Needed

No new commands — the same `kotlinc ... -include-runtime -d ...` /
`java -jar ...` pair from Lesson 0.1.

### Run It

Real output, `Calculator.kt` at its current state (verified this
session as `step1_describe_extension.kt`):

```
$ kotlinc Calculator.kt -include-runtime -d Calculator.jar
$ java -jar Calculator.jar
```

Real output:

```
Calculator starting up
6 PLUS 0 = 6
```

A readable sentence, built entirely by `describe`'s own string
template, replacing Lesson 0.8's own
`Calculation(operator=PLUS, operandA=6, operandB=0, result=6)` form.

### Connect

`Calculation` can now describe itself in plain language, added entirely
from outside its own declaration. The next unit teaches the first of
three scope functions this lesson applies to `Calculator.kt` for real.

---

## Concept Unit: `let`

### The Problem

`operandB`, since Lesson 0.5, is `Int?` — genuinely possibly `null` —
and this curriculum's own established pattern for it, `operandB ?:
0`, given full treatment in that lesson, handles the *absent* case by
substituting a default. Nothing in `Calculator.kt`, though, currently
does anything special when `operandB` genuinely *is* present — worth
knowing, perhaps, for a log message a real calculator might want to
show. Given that Lesson 0.5 already proved `?.`, a safe call, skips its
own right-hand side entirely when its target is `null`, what do you
think it would take to run an entire block of code — not just one
method call — only when a nullable value is genuinely non-null,
receiving that safely-unwrapped value under some name inside the
block? Would you expect that name to be one you choose yourself, the
way a lambda's own parameter has been every time this curriculum has
used one since Lesson 0.9, or something automatic?

### Project Change

- **Reference Source** — no reference counterpart; from-scratch, per
  the BRD's scope-functions concept for this lesson (`let`
  specifically).
- **Files affected** — modified: `Calculator.kt`.
- **Change type** — add (one new line inside `main`).
- **Location** — inside `main`, immediately after the
  `val operandB: Int? = null` line from Lesson 0.5.
- **Dependencies** — none beyond Lesson 0.5.

### The New Code

```kotlin
operandB?.let { println("Using provided operand: $it") }
```

### The Updated Project

```kotlin
1: fun main() {
2:     val calculator = Calculator(6)
3:     val operandB: Int? = null
4:     operandB?.let { println("Using provided operand: $it") }  // ← new
5:     val operatorChoice = Operator.PLUS
6:     ...
```

### Introduce the Concept in Isolation

A disposable scratch file (`verification/0.10/lab2_let.kt`), using
both a present and a genuinely missing value, to prove `let`'s own
block really is skipped, not merely passed a `null`:

```kotlin
fun main() {
    val present: Int? = 5
    val missing: Int? = null
    present?.let { println("Have a value: $it") }
    missing?.let { println("Have a value: $it") }
}
```

Compiled and run this session:

```
$ kotlinc lab2_let.kt -include-runtime -d lab2_let.jar
$ java -jar lab2_let.jar
```

Real output:

```
Have a value: 5
```

Only one line printed, not two — `present?.let { ... }` ran its block,
receiving `5` as `it`; `missing?.let { ... }` never ran its block at
all, because the safe call given full treatment in Lesson 0.5 already
short-circuits the instant its target is `null`, before `let` itself
is ever reached. This confirms `let`'s own real behavior — running a
lambda with the receiver as its one argument, named `it`, given full
treatment in this lesson's Header — combines with a safe call to
produce "run this block, only if this value is actually present," a
pattern real Kotlin code uses constantly for exactly this reason.

### Discard the Throwaway Example

`lab2_let.kt` is scratch, recorded in the verification folder, not
part of the calculator project. What it proved — that `?.let { }`
genuinely skips its block for a `null` receiver, not merely passes
`null` into it — is what `operandB?.let { ... }`, above, relies on.

### Mechanical Walkthrough

Every distinct syntactic element in the New Code:

- **`operandB?.let { ... }`** — `operandB`, reading the nullable `Int?`
  value given full treatment in Lesson 0.5; `?.`, the safe call given
  full treatment in that same lesson, checking `operandB` for `null`
  before proceeding; `let`, given full treatment in this lesson's
  Header, called on whatever `operandB` turns out to hold when the
  safe call actually proceeds.
- **`{ println("Using provided operand: $it") }`** — a lambda
  expression, given full treatment in Lesson 0.9, with no explicitly
  named parameter; `it`, given full treatment in this lesson's Header,
  automatically refers to `let`'s own one argument — the safely
  non-null `Int` `operandB` held at the moment this line ran. Its
  body, `println("Using provided operand: $it")`, calls the same
  overloaded `println` given full treatment in Lesson 0.1, its argument
  built with a string template, given full treatment in Concept Unit 1
  of this lesson, substituting `it`'s own real value directly.

### CS Lens

Running an action only when a value is genuinely present, receiving
that value directly inside the action rather than checking for its
presence and then separately re-reading it, is a pattern that recurs
anywhere optional data needs to be acted on safely. Also recognized in:
JavaScript's own optional chaining combined with a guard
(`value?.someMethod()`, conceptually paired with "and only log this if
it ran"); a mail carrier who only rings the doorbell if someone's
actually listed as expecting a package, never for an empty mailbox; a
factory sensor that only triggers a downstream action when a part is
actually detected on the line, not for an empty gap; a form validator
that only runs a save action once a required field has actually been
filled in.

### SE Lens

The alternative to `operandB?.let { ... }` is a full
`if (operandB != null) { println("Using provided operand: $operandB")
}` — functionally identical, longer, and, per Lesson 0.5's own SE
Lens, exactly the shape `?.` already exists to shorten. `let` doesn't
replace that reasoning; it extends it from "one safe method call" to
"an entire block of code," while still keeping the safely-unwrapped
value conveniently named (`it`) inside that block, rather than needing
a fresh `if`-scoped smart-cast the way the `if`-based version would
rely on. The real cost, honestly: for a block this short, `let` saves
very little over the `if` version — its value compounds as the guarded
block grows longer or gets chained with other scope functions, a
pattern this lesson's own later units build toward.

### Commands Needed

No new commands.

### Run It

Real output, `Calculator.kt` at its current state (verified this
session as `step2_let_operand.kt`):

```
$ kotlinc Calculator.kt -include-runtime -d Calculator.jar
$ java -jar Calculator.jar
```

Real output:

```
Calculator starting up
6 PLUS 0 = 6
```

Identical to Concept Unit 1's output — because `operandB` really is
`null` in this exact run, `operandB?.let { ... }`'s own block never
executes, proven by the same real mechanism this unit's own lab
demonstrated for `missing`.

### Connect

`let` now safely acts on `operandB` only when it's genuinely present.
The next unit uses a scope function for the opposite kind of
convenience: configuring an object right where it's built.

---

## Concept Unit: `apply`

### The Problem

`Calculator(6)` builds a calculator, and the very next thing
`Calculator.kt` has always done, since Lesson 0.1, is print a
starting-up message — currently as a separate `println` statement, with
no real connection, in the code itself, between "the calculator was
just created" and "this message announces it." Given that Lesson 0.6
already proved a method reads an object's own properties as an
implicit receiver, and given that `let`'s own lambda, in the previous
unit, received its receiver as `it`, what do you think it would take
for a similar block to receive its receiver as `this` instead — letting
the block read that object's own properties bare, the same way a real
method inside the class would — and then hand that *exact same object*
back, rather than whatever the block itself computes? What would
`calculator` end up holding if such a block returned something other
than the object it configured?

### Project Change

- **Reference Source** — no reference counterpart; from-scratch, per
  the BRD's scope-functions concept for this lesson (`apply`
  specifically).
- **Files affected** — modified: `Calculator.kt`.
- **Change type** — replace (the separate `Calculator(6)` construction
  and the standalone `println("Calculator starting up")` line become
  one `apply`-scoped expression).
- **Location** — the `println("Calculator starting up")` and
  `val calculator = Calculator(6)` lines, both present since Lesson
  0.1/0.6.
- **Dependencies** — none beyond Lesson 0.6.

### The New Code

```kotlin
val calculator = Calculator(6).apply {
    println("Calculator initialized with displayValue = $displayValue")
}
```

### The Updated Project

```kotlin
1: fun main() {
2:     val calculator = Calculator(6).apply {                    // ← changed
3:         println("Calculator initialized with displayValue = $displayValue")  // ← changed
4:     }                                                            // ← changed
5:     val operandB: Int? = null
6:     operandB?.let { println("Using provided operand: $it") }
7:     ...
```

`main`'s original standalone `println("Calculator starting up")` from
Lesson 0.1 is gone — its teaching job is done, and its message now
lives directly inside the construction of the object it was always
describing.

### Introduce the Concept in Isolation

A disposable scratch file (`verification/0.10/lab3_apply.kt`), using a
fresh, unrelated class, to confirm `apply` genuinely returns the
receiver, not the block's own result:

```kotlin
class Counter(var count: Int)

fun main() {
    val counter = Counter(0).apply {
        count = 10
        println("Counter set up with count = $count")
    }
    println(counter.count)
}
```

Compiled and run this session:

```
$ kotlinc lab3_apply.kt -include-runtime -d lab3_apply.jar
$ java -jar lab3_apply.jar
```

Real output:

```
Counter set up with count = 10
10
```

Inside the `apply` block, `count` — read *and* written — refers
directly to the new `Counter` object's own property, with no receiver
name in front of it, the same **implicit receiver** mechanism Lesson
0.6 proved for an ordinary method, here written as `this` (never
explicitly typed in this example, since it's the default and only
receiver available). The final `println(counter.count)`, outside the
`apply` block entirely, prints `10` — proving `counter` itself holds
the real `Counter` object `apply` was called on, already configured,
not `Unit` or the block's own printed message.

### Discard the Throwaway Example

`lab3_apply.kt` is scratch, recorded in the verification folder, not
part of the calculator project. What it proved — that `apply`
configures its receiver via `this` and then returns that exact
receiver — is what `Calculator(6).apply { ... }`, above, relies on.

### Mechanical Walkthrough

Every distinct syntactic element in the New Code:

- **`Calculator(6)`** — the same constructor call given full treatment
  in Lesson 0.6, building a new `Calculator` object with `displayValue`
  initialized to `6`.
- **`.apply { ... }`** — `apply`, given full treatment in this lesson's
  Header, called directly on the just-built `Calculator` object using
  the same dot-call syntax given full treatment in Lesson 0.6.
- **`println("Calculator initialized with displayValue = $displayValue")`**
  — the same overloaded `println` given full treatment in Lesson 0.1;
  its argument, a string template given full treatment in Concept Unit
  1 of this lesson; `$displayValue`, inside it, reads `displayValue`
  bare — `Calculator`'s own property, given full treatment in Lesson
  0.6 — because inside `apply`'s own lambda, the `Calculator` object
  itself is the implicit receiver (`this`), the identical mechanism an
  ordinary method inside `Calculator`'s own declaration already uses.
- **`val calculator = Calculator(6).apply { ... }`** — the same `val`
  and `=` given full treatment in Lesson 0.1; because `apply` returns
  its own receiver, unchanged, `calculator` ends up holding the exact
  `Calculator` object `Calculator(6)` built — `apply`'s own block ran
  purely for its printed side effect, changing nothing about what
  `calculator` actually is.

### CS Lens

Configuring an object immediately after constructing it, in the same
expression that builds it, rather than in separate statements that
follow, keeps "what this object is" and "what was done to set it up"
visually together. Also recognized in: a builder pattern in
traditional object-oriented design, chaining configuration calls that
each return the same object being built; a car arriving from the
factory already having its mirrors adjusted and fluids topped off as
part of the build process itself, not as separate steps after delivery;
a recipe's "prepare the pan" instruction folded into the same paragraph
as "grease and flour it," rather than split across two disconnected
steps; a package's own unboxing instructions printed on the inside of
the box itself, delivered together with the product, not as a separate
document.

### SE Lens

The alternative — `val calculator = Calculator(6)` on one line, then a
separate `println` on the next, exactly how Lesson 0.1 through Lesson
0.9 always wrote it — is not wrong, and this curriculum used it
successfully for nine lessons. The real difference `apply` makes: the
construction and its own accompanying setup become one expression,
one value, assigned once — useful specifically when several
configuration steps belong together as a single logical unit,
appearing as a single connected block instead of a sequence of
statements a reader has to mentally group back together themselves.
The real cost: `apply`'s block runs with an implicit `this`, and if that
block happens to also reference an *outer* `this` (from a surrounding
class, not covered in this lesson), the two can shadow each other — a
real, documented Kotlin gotcha this lesson's own single-`this` example
never encounters, but worth knowing exists once real projects nest
scope functions inside methods of their own classes.

### Commands Needed

No new commands.

### Run It

Real output, `Calculator.kt` at its current state (verified this
session as `step3_apply_calculator.kt`):

```
$ kotlinc Calculator.kt -include-runtime -d Calculator.jar
$ java -jar Calculator.jar
```

Real output:

```
Calculator initialized with displayValue = 6
6 PLUS 0 = 6
```

The startup message now reports the real `displayValue` directly from
inside the object's own construction, rather than a fixed, generic
string.

### Connect

`Calculator` is now built and announced in one connected expression.
The last unit in this lesson uses a third scope function to record a
finished calculation as a side effect, without disturbing the value
itself.

---

## Concept Unit: `also`

### The Problem

`calculation`, once built, is only ever used for its own
`describe()`'s printed output — but a real calculator might reasonably
want to *do something with* a finished calculation (log it, save it
for history) while still keeping `calculation` itself, unchanged, for
whatever comes next. `apply`, from the previous unit, returns its
receiver too — but its block reads that receiver as `this`, meaning a
call to `describe()` inside an `apply` block would read
`calculation.describe()` as if `describe` were a method already inside
`Calculation` itself, when Concept Unit 1 specifically added it as a
*separate* extension function. Given that `let`, two units ago,
receives its receiver as `it` rather than `this`, what do you think a
scope function combining `let`'s own `it`-style access with `apply`'s
own "return the receiver, not the block's result" behavior might look
like — and why might a reader want a scope function that receives `it`
specifically, rather than `this`, for a value being logged rather than
configured? Looking at `apply`'s own real signature again, what part of
it would need to change to receive `it` instead of `this`, while still
returning the receiver?

### Project Change

- **Reference Source** — no reference counterpart; from-scratch, per
  the BRD's scope-functions concept for this lesson (`also`
  specifically), completing the "review and tighten
  [`Calculator.kt`'s] idioms" goal this lesson's own Closing (Lesson
  0.9's) set.
- **Files affected** — modified: `Calculator.kt`.
- **Change type** — replace (`val calculation = Calculation(...)`
  followed by a separate `println(calculation.describe())` becomes one
  `also`-scoped expression).
- **Location** — the final two lines of `main`, present since Lesson
  0.8/Concept Unit 1 of this lesson.
- **Dependencies** — none beyond Concept Unit 1 of this lesson.

### The New Code

```kotlin
val calculation = Calculation(operatorChoice, operandA, safeOperandB, calculator.displayValue).also {
    println("Recorded: ${it.describe()}")
}
```

### The Updated Project

```kotlin
1: fun interface Operation {
2:     fun apply(current: Int, amount: Int): Int
3: }
4: class Addition : Operation {
5:     override fun apply(current: Int, amount: Int): Int {
6:         return current + amount
7:     }
8: }
9: class Subtraction : Operation {
10:     override fun apply(current: Int, amount: Int): Int {
11:         return current - amount
12:     }
13: }
14: class Multiplication : Operation {
15:     override fun apply(current: Int, amount: Int): Int {
16:         return current * amount
17:     }
18: }
19: class Division : Operation {
20:     override fun apply(current: Int, amount: Int): Int {
21:         return current / amount
22:     }
23: }
24:
25: class Calculator(var displayValue: Int) {
26:     fun perform(operation: Operation, amount: Int) {
27:         displayValue = operation.apply(displayValue, amount)
28:     }
29: }
30:
31: enum class Operator(val operation: Operation) {
32:     PLUS(Addition()),
33:     MINUS(Subtraction()),
34:     TIMES(Multiplication()),
35:     DIVIDE(Division())
36: }
37:
38: data class Calculation(val operator: Operator, val operandA: Int, val operandB: Int, val result: Int)
39:
40: fun Calculation.describe(): String {
41:     return "$operandA $operator $operandB = $result"
42: }
43:
44: fun main() {
45:     val calculator = Calculator(6).apply {
46:         println("Calculator initialized with displayValue = $displayValue")
47:     }
48:     val operandB: Int? = null
49:     operandB?.let { println("Using provided operand: $it") }
50:     val operatorChoice = Operator.PLUS
51:     val safeOperandB = operandB ?: 0
52:     val operandA = calculator.displayValue
53:     calculator.perform(operatorChoice.operation, safeOperandB)
54:     val calculation = Calculation(operatorChoice, operandA, safeOperandB, calculator.displayValue).also {  // ← changed
55:         println("Recorded: ${it.describe()}")                                                                // ← changed
56:     }                                                                                                          // ← changed
57: }
```

This is `Calculator.kt`'s complete, final state for Slice 0 — every
line shown here, in full, not elided.

### Introduce the Concept in Isolation

A disposable scratch file (`verification/0.10/lab4_also.kt`), using a
fresh example, to confirm `also` genuinely returns the receiver
unchanged, the same way Concept Unit 3 proved for `apply`, while still
receiving it as `it`:

```kotlin
data class Item(val name: String, val price: Int)

fun main() {
    val item = Item("Widget", 10).also {
        println("Created: $it")
    }
    println(item.name)
}
```

Compiled and run this session:

```
$ kotlinc lab4_also.kt -include-runtime -d lab4_also.jar
$ java -jar lab4_also.jar
```

Real output:

```
Created: Item(name=Widget, price=10)
Widget
```

`$it` inside the `also` block printed `Item`'s own real, auto-generated
`toString()`, given full treatment in Lesson 0.8 — proving `it` here
refers to the whole `Item` object, exactly the way `let`'s own `it`
did in Concept Unit 2. `println(item.name)`, outside the block, proves
`item` itself is the real, complete `Item` object `also` was called
on — its `name` property, given full treatment in Lesson 0.6, reads
correctly, confirming `also`'s block ran purely for its own printed
side effect, changing nothing about the value `item` actually holds.

### Discard the Throwaway Example

`lab4_also.kt` is scratch, recorded in the verification folder, not
part of the calculator project. What it proved — that `also` returns
its receiver unchanged, made available inside its own block as `it` —
is what `Calculation(...).also { ... }`, above, relies on.

### Mechanical Walkthrough

Every distinct syntactic element in the New Code:

- **`Calculation(operatorChoice, operandA, safeOperandB, calculator.displayValue)`**
  — the same constructor call given full treatment in Lesson 0.8,
  unchanged in its four arguments from every prior lesson touching
  `Calculation`.
- **`.also { ... }`** — `also`, given full treatment in this lesson's
  Header, called on the freshly-built `Calculation` object using the
  same dot-call syntax given full treatment in Lesson 0.6.
- **`println("Recorded: ${it.describe()}")`** — the same overloaded
  `println` given full treatment in Lesson 0.1; its argument, a string
  template given full treatment in Concept Unit 1 of this lesson, this
  time substituting `${it.describe()}` — a whole expression, not a bare
  name, requiring the `{` `}` form rather than the plain `$name` form;
  `it`, given full treatment in this lesson's Header, refers to the
  `Calculation` object `also` was called on; `.describe()` calls this
  lesson's own extension function, given full treatment in Concept Unit
  1, on it directly.
- **`val calculation = ...also { ... }`** — the same `val`/`=` already
  given full treatment; because `also` returns its own receiver
  unchanged, `calculation` ends up holding the exact `Calculation`
  object that was just constructed and logged — identical, in this
  specific respect, to how `apply` left `calculator` holding its own
  freshly-built receiver in Concept Unit 3.

### CS Lens

Performing a side effect — logging, recording, notifying — on a value
at the exact moment it's produced, without changing what that value
actually is or interrupting the expression that produces it, is a
widely recurring need. Also recognized in: a shipping label printed
and attached the instant a package is packed, without altering the
package's own contents; a security camera logging a person's entry
without changing anything about the person or the room; a scientific
instrument's own data logger, recording a measurement the instant it's
taken without perturbing the measurement itself; a cash register's
receipt, printed as a record of a completed sale, the sale itself
already finished and unaffected by whether the receipt prints or not.

### SE Lens

`also` and `apply` share the identical real signature shape — both
return their own receiver — differing only in whether that receiver
arrives as `this` (`apply`) or `it` (`also`). This lesson's own two
real uses show the actual rule of thumb behind that choice: `apply`
was used for `Calculator`'s own construction, where the block's whole
job was *configuring the receiver's own properties* (`displayValue`,
read bare, as if already inside `Calculator`'s own body) — `this`
access reads naturally there. `also` was used for `Calculation`'s own
creation, where the block's job was *doing something involving* the
receiver (calling `describe()`, a separate extension function, and
printing the result) rather than reaching directly into its own
properties — `it`, an explicit, named value, reads more naturally when
the receiver is being *used*, not *configured*. Neither rule is
enforced by the compiler; both compile with either scope function, and
the choice between them is genuinely a matter of which reads more
naturally at a given call site — a judgment call, not a fixed law, this
lesson's own two real examples were chosen specifically to illustrate
both directions of.

### Commands Needed

No new commands.

### Run It

Real output, `Calculator.kt`'s complete, final state for Slice 0
(verified this session as `step4_also_calculation.kt`):

```
$ kotlinc Calculator.kt -include-runtime -d Calculator.jar
$ java -jar Calculator.jar
```

Real output:

```
Calculator initialized with displayValue = 6
Recorded: 6 PLUS 0 = 6
```

Two lines — down from Lesson 0.1's own separate "starting up" message
and Lesson 0.8's raw data-class dump — both now carrying real,
specific information about this exact run, each produced by a scope
function reading its receiver the way that receiver was actually being
used.

### Connect

`Calculator.kt` now builds, configures, computes, and records a
calculation using idiomatic Kotlin throughout — `let`, `apply`, and
`also`, each applied where it genuinely reads better than the
alternative. This is the last new concept this lesson introduces to
the real project; one further scope function, `run`, is covered in
isolation only, below.

---

## Concept Unit: `run`, and Choosing Among Four

### The Problem

`let`, `apply`, and `also` cover three of Kotlin's four standard scope
functions — each now applied somewhere real in `Calculator.kt`. The
fourth, `run`, doesn't fit naturally anywhere `Calculator.kt`'s own
code currently needs it — but reading unfamiliar Kotlin without getting
lost, this lesson's own stated goal, means recognizing it on sight
regardless. Given `let`'s own real signature, given full treatment in
Concept Unit 2 (`fun <T, R> T.let(block: (T) -> R): R` — receiver as
`it`, returns the block's own result) and `apply`'s (given full
treatment in Concept Unit 3 — receiver as `this`, returns the
receiver), what do you think the fourth combination — receiver as
`this`, but returning the *block's own result*, not the receiver —
would actually be called, and what might it be useful for that the
other three aren't? If such a scope function were called with no
receiver at all — just a bare block — what do you think it would
actually do, given that "receiver as `this`" has nothing to attach to
without one?

### Project Change

- **Reference Source** — no reference counterpart; from-scratch, per
  the BRD's scope-functions concept for this lesson (`run`
  specifically).
- **Files affected** — none; this unit is isolated-lab only, the same
  choice Lesson 0.7's own Concept Unit 4 made for `!!`, and for the
  identical reason: `run` doesn't fit anywhere `Calculator.kt`'s real
  code currently needs it, and forcing it in would teach a worse
  example than an honest, general one.
- **Change type** — n/a.
- **Location** — n/a.
- **Dependencies** — none beyond Concept Units 2–3 of this lesson.

### The New Code

n/a for this unit — see the isolated labs below; per this unit's own
Project Change, no code lands in `Calculator.kt`.

### The Updated Project

n/a — `Calculator.kt` is unchanged by this unit; its state remains
exactly `step4_also_calculation.kt`, already shown as this lesson's Run
It in Concept Unit 4, above — Slice 0's own final, shipped state.

### Introduce the Concept in Isolation

First, `verification/0.10/lab5_run.kt`, using `run` with no receiver at
all — Kotlin's other real use for it, a plain scoped block:

```kotlin
fun main() {
    val total = run {
        val a = 10
        val b = 5
        a + b
    }
    println(total)
}
```

Compiled and run this session:

```
$ kotlinc lab5_run.kt -include-runtime -d lab5_run.jar
$ java -jar lab5_run.jar
```

Real output:

```
15
```

`a` and `b`, declared inside the `run` block, exist only for that
block's own duration — neither is visible outside it — and `total`
ends up holding `15`, the block's own final expression's value, the
same "last expression becomes the result" rule Lesson 0.2 already
proved for an expression-bodied function's own single line. This
proves `run`'s core behavior: unlike `apply`, which always hands back
its receiver, `run` hands back whatever its own block computes.

Second, `verification/0.10/lab5b_run_receiver.kt`, using `run` the way
`apply`/`also`/`let` are more commonly used — called *on* a receiver:

```kotlin
data class Item(val name: String, val price: Int)

fun main() {
    val item = Item("Widget", 10)
    val summary = item.run {
        "$name costs $price"
    }
    println(summary)
}
```

Compiled and run this session:

```
$ kotlinc lab5b_run_receiver.kt -include-runtime -d lab5b_run_receiver.jar
$ java -jar lab5b_run_receiver.jar
```

Real output:

```
Widget costs 10
```

Inside `item.run { ... }`, `name` and `price` read bare — the same
implicit `this` receiver access `apply` uses, given full treatment in
Concept Unit 3 — but `summary` ends up holding the block's own string
template result, `"Widget costs 10"`, not `item` itself. This is called
**`run`**: `this`-style receiver access, like `apply`, combined with
"return the block's own result," like `let` — the one combination the
other three scope functions this lesson covers don't provide.

### Discard the Throwaway Examples

`lab5_run.kt` and `lab5b_run_receiver.kt` are scratch, recorded in the
verification folder, not part of the calculator project — `run`
remains, deliberately, isolated-lab knowledge only for this curriculum,
per this unit's own Project Change.

### Mechanical Walkthrough

Every distinct syntactic element in the two lab files above:

- **`run { ... }`** (no receiver) — `run`, a scope function called with
  no receiver in front of it, meaning there's no `this`/`it` to speak
  of at all inside its own block; its body runs top to bottom, the
  same statement-by-statement execution order given full treatment in
  Lesson 0.1, and its own last expression, `a + b`, becomes `run`'s own
  return value.
- **`val a = 10`**, **`val b = 5`** — the same `val`/`=` already given
  full treatment, scoped entirely to the `run` block's own body —
  neither name exists once the block ends.
- **`item.run { ... }`** — `run`, this time called directly on `item`,
  giving its own block the identical implicit `this` receiver access
  `apply` provides; `"$name costs $price"`, a string template given
  full treatment in Concept Unit 1, reading `item`'s own `name` and
  `price` properties bare, becomes the block's own last expression and
  therefore `run`'s own returned value.

### CS Lens

Combining "temporary access to an object's own members" with "compute
and return a fresh result from them" — rather than either changing the
object or merely acting on it as a side effect — is its own distinct,
recurring shape once "configure and return the receiver" (`apply`) and
"act on the receiver as a side effect" (`also`/`let`) are already
covered. Also recognized in: a spreadsheet formula that reads several
of a row's own cells and computes a brand-new value, without altering
any of those cells; a translator reading a whole paragraph in context
and producing a new paragraph in a different language, the original
left untouched; an accountant reviewing a company's own books and
producing a summary report, the books themselves unmodified by the
review; a mapmaker surveying a real landscape and producing a map — a
genuinely new artifact, derived from, but not identical to, what was
surveyed.

### SE Lens

Four scope functions, two real axes: does the block receive its
receiver as `this` or `it`, and does the whole expression return the
receiver or the block's own result. `apply` (`this`, returns receiver)
and `also` (`it`, returns receiver) both leave the receiver itself
unchanged in what the surrounding code holds afterward — the real
choice between them, per Concept Unit 4's own SE Lens, is just which
reads more naturally at the call site. `let` (`it`, returns block
result) and `run` (`this`, returns block result) both replace the
surrounding value with something newly computed — the choice between
those two is the identical `this`-versus-`it` readability question,
one level up. Memorizing this two-by-two shape is less valuable than
what this lesson's own four real and lab uses already demonstrated
directly: each one solves a genuinely different, nameable problem
(guard against absence; configure and keep; act on and keep; compute
something new), and recognizing *which problem a given block is
solving* is what actually picks the right one — the mechanical
this/it/receiver/result shape follows from that choice, not the other
way around.

### Commands Needed

No new commands.

### Run It

This unit adds nothing to `Calculator.kt` — per its own Project
Change, there is no new project-level Run It here. `Calculator.kt`'s
real, final output for Slice 0 remains exactly what Concept Unit 4
already verified.

### Connect

All four of Kotlin's standard scope functions are now real, both
proven and named — three of them applied directly in `Calculator.kt`,
the fourth demonstrated in full, general isolation. This is the last
new concept this lesson introduces.

---

## Connect the Pieces

Follow `Calculator.kt`'s complete real run through every unit this
lesson built, using its actual final state:

1. `Calculator(6).apply { println(...) }` runs (Concept Unit 3): a new
   `Calculator` object is built, its `displayValue` (given full
   treatment in Lesson 0.6) read bare inside `apply`'s own block via
   the implicit `this` receiver, printing
   `Calculator initialized with displayValue = 6`; `apply` then returns
   that exact object, which `calculator` now holds.
2. `operandB?.let { ... }` runs (Concept Unit 2): `operandB` is `null`,
   so the real safe call given full treatment in Lesson 0.5
   short-circuits before `let`'s own block ever runs — proven, by this
   lesson's own lab, to be a genuine skip, not a `null` silently passed
   in.
3. `operatorChoice`, `safeOperandB`, and `operandA` are set up exactly
   as Lesson 0.9 left them.
4. `calculator.perform(operatorChoice.operation, safeOperandB)` runs,
   the identical real polymorphic dispatch Lesson 0.7 built and Lesson
   0.9 extended to accept a lambda-built `Operation`, updating
   `displayValue` via the real `Int.plus` this curriculum proved in
   Lesson 0.1.
5. `Calculation(...).also { println("Recorded: ${it.describe()}") }`
   runs (Concept Units 1 and 4 together): a new `Calculation` record,
   given full treatment in Lesson 0.8, is built; inside `also`'s own
   block, `it` refers to that exact record, and `it.describe()` — this
   lesson's own new extension function, given full treatment in Concept
   Unit 1 — builds the string `"6 PLUS 0 = 6"` via a string template;
   `also` then returns the unchanged `Calculation`, which `calculation`
   now holds.

Two lines of real, verified terminal output —
`Calculator initialized with displayValue = 6` and
`Recorded: 6 PLUS 0 = 6` — are `Calculator.kt`'s complete, final,
shipped behavior for Slice 0: a terminal calculator, built from
functions (Lesson 0.2), decisions (Lesson 0.3), collections knowledge
(Lesson 0.4), nullability handling (Lesson 0.5), a real class (Lesson
0.6), polymorphism through an interface (Lesson 0.7), a closed enum and
a structurally-equal data record (Lesson 0.8), functions as values
(Lesson 0.9), and, this lesson, written the way idiomatic Kotlin is
actually written. **Slice 0 — Console Calculator — ships here.** Stage
1 — Android Fundamentals — picks up next, moving this same calculator
logic onto its first real Android project and its first on-screen UI.
