# Lesson 0.7: One Shape, Many Behaviors

**What you will build.** `Calculator.kt`'s four separate
`add`/`subtract`/`multiply`/`divide` methods become four small classes
sharing one common contract — an `Operation` interface — and
`Calculator` shrinks to a single `perform` method that runs whichever
`Operation` it's handed, without knowing or caring which one that is.
The transferable problem underneath the feature: how to write code that
works correctly against *several different, unrelated* concrete
implementations, through one shared shape, without that code needing to
change every time a new implementation is added.

**What you need to know first.** `Calculator.kt` as Lesson 0.6 left it:
a `Calculator` class with a `displayValue` property and four methods,
each mutating it directly. Also `class`, properties, and the primary
constructor, from Lesson 0.6, and `when`, from Lesson 0.3.

**Terms used in this lesson**

- **program** — a finite sequence of instructions a computer executes
  in order. This lesson reorganizes which class is responsible for
  which instructions, not the fact that they still run in sequence.
- **value** — a piece of data a program holds and operates on. This
  lesson's new objects (`Addition()`, `Subtraction()`, and the others)
  are values in exactly Lesson 0.1's sense — held, passed around, and
  operated on, here specifically passed as arguments.
- **type** — a category determining what a value's data is and what
  operations are valid on it. This lesson introduces a new *kind* of
  type: one that describes a *contract* several unrelated classes can
  each satisfy in their own way, rather than one concrete shape.
- **`class`** — a blueprint describing what data and behavior a kind of
  object has, given full treatment in Lesson 0.6. This lesson declares
  five new ones: `Addition`, `Subtraction`, `Multiplication`,
  `Division`, and, implicitly, every class a programmer writes to
  satisfy this lesson's new interface.
- **property** — a value belonging to a specific object, given full
  treatment in Lesson 0.6. `Calculator`'s own `displayValue` is
  unchanged; this lesson does not add or remove any properties.
- **method** — a function declared inside a class, callable only on a
  specific object of that class, given full treatment in Lesson 0.6.
  This lesson replaces `Calculator`'s four separate methods with one,
  `perform`, and gives `Operation`'s own implementing classes their
  first method each, `apply`.
- **primary constructor** — the parameter list written directly in a
  class's own declaration, given full treatment in Lesson 0.6.
  `Calculator`'s own constructor, `(var displayValue: Int)`, is
  unchanged this lesson.
- **interface** — a contract describing what methods a class must
  provide, with no implementation of its own — no data, and no working
  code, only a description of a shape. It exists so that code can
  depend on *what something can do* without depending on *which
  specific class actually does it* — a promise every implementing class
  keeps, checked by the compiler, without those classes needing to
  share any code, any data, or any relationship to each other beyond
  the shared promise itself.
- **implementation (of an interface)** — a class that provides real,
  working code for every method an interface declares, written as
  `class ClassName : InterfaceName { ... }` — the same `:` syntax
  Kotlin also uses for extending a class, though this lesson only ever
  uses it to satisfy an interface's contract, not to inherit from
  another concrete class. It exists as the other half of an interface's
  promise: the interface states what must exist; an implementation is
  where it actually does.
- **`override`** — a keyword required on any method that provides the
  real, working body for a method an interface (or a parent class)
  only declared. It exists so a reader — and the compiler — can tell,
  at a glance, that a given method is deliberately satisfying an
  existing contract, rather than accidentally declaring an unrelated
  method that merely happens to share a name.
- **abstraction** — writing code against what a type can *do*, stated
  by an interface, without that code needing to know which concrete
  class it's actually working with underneath. It exists so a function
  or method can be written exactly once and still correctly handle any
  future implementation of an interface, including ones that don't
  exist yet at the moment that function is written.
- **polymorphism** — the same call, written once, producing genuinely
  different real behavior depending on which concrete object it's
  actually run on at the moment the program executes. It exists as the
  direct, observable payoff of abstraction: code written against an
  interface doesn't just *tolerate* different implementations, it
  *behaves differently and correctly* for each one, automatically,
  without any conditional logic checking which one it got.
- **composition** — one object holding or receiving a reference to
  another object, and using it through that other object's own public
  contract, without being that other object or extending its class.
  It exists as the alternative to inheritance for describing how two
  objects relate: not "this object *is* a more specific version of
  that one," but "this object *uses* that one to get part of its job
  done" — a "has-a" or "uses-a" relationship, contrasted directly with
  an implementing class's "is-a" relationship to the interface it
  satisfies, in this lesson's own Concept Unit 4, below.

**Objects and methods used**

- **`Operation`**
  - *What it is:* this lesson's own new interface — the shared contract
    every one of the calculator's four operations satisfies.
  - *Implementation:* `interface Operation { fun apply(current: Int,
    amount: Int): Int }` — one method, declared but not given a body:
    every implementing class must provide its own real `apply`, taking
    the calculator's current running total and the amount to combine it
    with, returning the new total.
  - *Its use:* the shared type every one of this lesson's four
    operation classes satisfies, and the parameter type
    `Calculator.perform` (below) actually depends on.
  - *Type:* an interface declaration.
  - *Responsibility:* state, and nothing more, that any real
    implementation must provide one method, `apply`, with this exact
    signature — it has no data of its own and performs no computation
    itself.
  - *Depends on:* nothing; an interface has no constructor and cannot
    be instantiated on its own, proven directly in Concept Unit 1,
    below.
  - *Connects to:* implemented by `Addition`, `Subtraction`,
    `Multiplication`, and `Division` (all given full treatment below);
    used as the parameter type of `Calculator.perform`, which calls
    `apply` on whatever object it's actually given.
  - *Shape:* an abstraction boundary — the seam between `Calculator`'s
    own code and the actual arithmetic it delegates to, deliberately
    designed so neither side needs to know the other's concrete details.

- **`Addition`**
  - *What it is:* the first of four classes this lesson writes to
    satisfy the `Operation` interface — the calculator's addition,
    rewritten as a real implementing class.
  - *Implementation:* `class Addition : Operation { override fun
    apply(current: Int, amount: Int): Int { return current + amount }
    }`.
  - *Its use:* constructed and passed to `Calculator.perform` whenever
    `operatorSymbol` is `"+"`.
  - *Type:* a class implementing the `Operation` interface.
  - *Responsibility:* given a current total and an amount, compute and
    return their sum — nothing else; it holds no data of its own
    between calls.
  - *Depends on:* nothing to construct (`Addition()` takes no
    arguments); `apply` depends on the two `Int` arguments it's called
    with.
  - *Connects to:* implements `Operation`; called by
    `Calculator.perform` via `operation.apply(...)`, never by name
    directly from `perform`'s own code.
  - *Shape:* a concrete implementation, on the far side of the
    `Operation` abstraction boundary from `Calculator` itself.

- **`Subtraction`**
  - *What it is:* the second of four classes satisfying `Operation` —
    the calculator's subtraction, rewritten as a real implementing
    class.
  - *Implementation:* `class Subtraction : Operation { override fun
    apply(current: Int, amount: Int): Int { return current - amount }
    }`.
  - *Its use:* constructed and passed to `Calculator.perform` whenever
    `operatorSymbol` is `"-"`.
  - *Type:* a class implementing the `Operation` interface.
  - *Responsibility:* given a current total and an amount, compute and
    return their difference.
  - *Depends on:* nothing to construct; `apply` depends on its two
    `Int` arguments.
  - *Connects to:* implements `Operation`; called by
    `Calculator.perform` via `operation.apply(...)`.
  - *Shape:* a concrete implementation, the same architectural role as
    `Addition`.

- **`Multiplication`**
  - *What it is:* the third of four classes satisfying `Operation` —
    the calculator's multiplication, rewritten as a real implementing
    class.
  - *Implementation:* `class Multiplication : Operation { override fun
    apply(current: Int, amount: Int): Int { return current * amount }
    }`.
  - *Its use:* constructed and passed to `Calculator.perform` whenever
    `operatorSymbol` is `"*"`.
  - *Type:* a class implementing the `Operation` interface.
  - *Responsibility:* given a current total and an amount, compute and
    return their product.
  - *Depends on:* nothing to construct; `apply` depends on its two
    `Int` arguments.
  - *Connects to:* implements `Operation`; called by
    `Calculator.perform` via `operation.apply(...)`.
  - *Shape:* a concrete implementation, the same architectural role as
    `Addition` and `Subtraction`.

- **`Division`**
  - *What it is:* the fourth of four classes satisfying `Operation` —
    the calculator's division, rewritten as a real implementing class.
  - *Implementation:* `class Division : Operation { override fun
    apply(current: Int, amount: Int): Int { return current / amount }
    }` — still truncating toward zero, per the real `Int.div` behavior
    Lesson 0.2 proved.
  - *Its use:* constructed and passed to `Calculator.perform` whenever
    `operatorSymbol` is `"/"`.
  - *Type:* a class implementing the `Operation` interface.
  - *Responsibility:* given a current total and an amount, compute and
    return their truncated integer quotient; still does nothing special
    for a `0` amount, the same acknowledged gap carried since Lesson
    0.2.
  - *Depends on:* nothing to construct; `apply` depends on its two
    `Int` arguments.
  - *Connects to:* implements `Operation`; called by
    `Calculator.perform` via `operation.apply(...)`.
  - *Shape:* a concrete implementation, the same architectural role as
    the other three.

- **`Calculator`**
  - *What it is:* the calculator's own class, given full treatment in
    Lesson 0.6, now delegating its arithmetic instead of performing it
    directly.
  - *Implementation:* `class Calculator(var displayValue: Int) { fun
    perform(operation: Operation, amount: Int) { displayValue =
    operation.apply(displayValue, amount) } }` — one property
    (unchanged from Lesson 0.6) and one method, replacing the four
    separate ones Lesson 0.6 gave it.
  - *Its use:* still constructed once in `main`; now called through its
    single `perform` method instead of four separate ones.
  - *Type:* a class declaration, with a primary constructor.
  - *Responsibility:* hold one running total, and update it by
    delegating to whatever `Operation` it's given — no longer
    responsible for knowing how any specific arithmetic operation
    actually works.
  - *Depends on:* one `Int` argument at construction (unchanged); its
    `perform` method depends on an `Operation` object and an `Int`
    amount.
  - *Connects to:* constructed once in `main`; `main` calls `perform`,
    supplying whichever `Operation` object `operatorSymbol` selects;
    `perform` itself calls `apply` on that object, never on a named
    concrete class.
  - *Shape:* the calculator's own domain logic, now the composition
    side (given full treatment in this lesson's Header, above) of the
    `Operation` abstraction boundary.

- **`main`**
  - *What it is:* the specially-recognized JVM entry point, proven real
    with `javap` in Lesson 0.1.
  - *Implementation:* unchanged in declaration; its body now selects an
    `Operation` object instead of branching directly to a method call.
  - *Its use:* still the only reason the JVM knows where to start; now
    also the only place any `Operation` implementation ever gets
    constructed.
  - *Type:* a free (top-level) function.
  - *Responsibility:* be the program's single entry point.
  - *Depends on:* nothing to be declared; to run, depends on the file
    being compiled to a `.class` the JVM can load.
  - *Connects to:* called by the JVM's launcher; constructs a
    `Calculator` and one `Operation` implementation, then calls
    `calculator.perform(operation, ...)`.
  - *Shape:* the outermost public boundary of the whole program.

- **`println`**
  - *What it is:* the standard-library function writing text and a line
    break to standard output.
  - *Implementation:* real source, unchanged from Lesson 0.1
    (`jvmMain/kotlin/io/Console.kt`):
    ```kotlin
    /** Prints the given [message] and the line separator to the standard output stream. */
    @kotlin.internal.InlineOnly
    public inline fun println(message: Int) {
        System.out.println(message)
    }
    ```
    This lesson's own calls to it, printing `calculator.displayValue`,
    still resolve to this `Int` overload, unchanged from Lesson 0.6.
  - *Its use:* still this lesson's only way to make anything visible.
  - *Type:* a top-level `inline` function.
  - *Responsibility:* convert its one argument to text and write it,
    followed by a line separator, to standard output.
  - *Depends on:* exactly one argument.
  - *Connects to:* called from `main`; internally calls
    `System.out.println`.
  - *Shape:* a public standard-library API surface, unchanged in role.

---

## Concept Unit: Interfaces

### The Problem

`Calculator`'s four methods from Lesson 0.6 — `add`, `subtract`,
`multiply`, `divide` — all share the same shape: each takes one `Int`
and updates `displayValue`. Nothing in the code says this out loud,
though — a reader has to notice the pattern by eye, across four
separate method declarations, with nothing stopping a fifth method from
being added later in a completely different, incompatible shape. Given
that a `class`, per Lesson 0.6, describes both data and real, working
behavior together, what do you think it would take to describe *just
the shape* of a method — its name, its parameters, its return type —
without providing any actual working code for it at all? What would
calling a method like that even do, if nothing has said yet how it
actually works?

### Project Change

- **Reference Source** — no reference counterpart; from-scratch, per
  the BRD's `Interface` concept for this lesson.
- **Files affected** — modified: `Calculator.kt`.
- **Change type** — add (a new interface declaration).
- **Location** — above the existing `Calculator` class from Lesson 0.6.
- **Dependencies** — none beyond Lesson 0.6.

### The New Code

```kotlin
interface Operation {
    fun apply(current: Int, amount: Int): Int
}
```

### The Updated Project

This is a brand-new top-level declaration, added above everything
else — step 5's code above is the entirety of what's new, with nothing
surrounding it yet to show in context; `Calculator`'s own declaration,
directly below it in the file, is completely unchanged from Lesson 0.6
and not part of this unit's own change.

### Introduce the Concept in Isolation

A disposable scratch file
(`verification/0.7/break1_interface_no_instance.kt`), using the BRD's
own worked example — a payment system — to check whether an interface
can be used the same way a class is:

```kotlin
interface Payment {
    fun pay(): String
}

fun main() {
    val payment = Payment()
    println(payment)
}
```

Compiled this session (deliberately, to observe the failure):

```
$ kotlinc break1_interface_no_instance.kt -include-runtime -d break1_interface_no_instance.jar
```

Real compiler output — this file was never run:

```
break1_interface_no_instance.kt:6:19: error: interface 'interface Payment : Any' does not have constructors.
    val payment = Payment()
                  ^^^^^^^
```

This proves an **interface** is genuinely not a class in disguise:
`Payment()` — the exact same construction syntax Lesson 0.6 proved
builds a real object from a class — fails outright, because an
interface has no constructor at all to call. The real error message
itself reveals something else worth noticing: `interface Payment :
Any` — every interface, like every class, ultimately traces back to
`Any`, the same root type this curriculum's Lesson 0.6 gave full
treatment for `toString()`. `Payment` here states only a shape (one
method, `pay`, returning a `String`) — it describes what any real
payment method must be able to do, without being a real, constructable
thing itself.

### Discard the Throwaway Example

`break1_interface_no_instance.kt` is scratch, recorded in the
verification folder, not part of the calculator project. What it
proved — that an interface has no constructor and cannot be built
directly — is exactly why `Operation`, above, exists only to be
*implemented*, not constructed on its own.

### Mechanical Walkthrough

Every distinct syntactic element in the New Code:

- **`interface`** — the keyword beginning an interface declaration,
  given full treatment in this lesson's Header. It tells the compiler
  unambiguously that a contract follows, not a class with real,
  working behavior of its own — the direct reason `Operation()`, unlike
  `Calculator()` from Lesson 0.6, could never be written anywhere in
  this lesson's code.
- **`Operation`** — an identifier (a programmer-chosen name, the same
  concept given full treatment in Lesson 0.2) naming this new contract.
- **`{` `}`** — a block, the same syntactic role Lesson 0.1 established
  for `main`'s own body, here bounding the interface's declared
  members instead of a function's instructions.
- **`fun apply(current: Int, amount: Int): Int`** — `fun`, the same
  keyword given full treatment in Lesson 0.2, here declaring a method's
  *shape* with no body at all — no `{ }`, no `return`, nothing a
  running program could actually execute. `apply`, an identifier
  naming the method every implementation must provide. `(current: Int,
  amount: Int)`, two parameters with type annotations, the same syntax
  given full treatment in Lesson 0.2, stating exactly what any real
  implementation's `apply` must accept: the calculator's running total,
  and the amount to combine it with. `: Int`, a return-type annotation,
  the same syntax given full treatment in Lesson 0.2, stating what any
  real implementation must hand back.

### CS Lens

Separating *what something must be able to do* from *how it actually
does it* — describing a contract with no working code of its own — is
one of the load-bearing ideas of software design, well beyond Kotlin.
Also recognized in: a job posting's list of required skills, describing
what any hired candidate must be able to do without specifying which
particular person will do it; a USB port's physical and electrical
specification, satisfied identically by a mouse, a keyboard, or a
flash drive, none of which the port itself needs to know about in
advance; a restaurant menu's description of a dish ("grilled, served
with two sides") that any of several cooks could prepare correctly,
each slightly differently, while still satisfying the same order; a
building code's fire-exit requirements, satisfied by many different
architectural designs that share no other similarity.

### SE Lens

Kotlin could have skipped interfaces entirely and let `Calculator`'s
four operations remain what Lesson 0.6 left them: four separate,
unrelated methods, related only by a reader's own intuition that they
"belong together." That alternative works, and this curriculum used it
successfully through Lesson 0.6. The real tradeoff an interface adds:
the compiler now enforces the shared shape directly — proven in Concept
Unit 2, next, by a real error when a class claims to implement
`Operation` without actually providing `apply` — at the cost of an
extra declaration (the interface itself) that has to be written and
maintained alongside every class that implements it. This lesson's own
next three units show that cost paying for itself directly, once a
function needs to work correctly with several different operations
without being rewritten for each one.

### Commands Needed

No new commands — the same `kotlinc ... -include-runtime -d ...` /
`java -jar ...` pair from Lesson 0.1.

### Run It

Real output, `Calculator.kt` at its current state (verified this
session as `step1_operation_interface.kt`):

```
$ kotlinc Calculator.kt -include-runtime -d Calculator.jar
$ java -jar Calculator.jar
```

Real output:

```
Calculator starting up
6
```

Unchanged from Lesson 0.6 — `Operation` exists in the file now, but
nothing implements or uses it yet.

### Connect

A real contract, `Operation`, now exists, proven distinct from a class
by its own real "cannot construct" error. The next unit gives it its
first real implementation.

---

## Concept Unit: Implementing an Interface

### The Problem

`Operation` currently describes a shape that nothing actually
provides — declaring it changed nothing about how the calculator
computes anything. Given `Operation`'s own contract — one method,
`apply(current: Int, amount: Int): Int` — and given that Lesson 0.6
already established how a class declares its own methods, what do you
think a class that actually *satisfies* `Operation`'s contract would
need to include? If a class claimed to implement `Operation` but never
actually wrote a working `apply` method, what do you think the compiler
would do about it?

### Project Change

- **Reference Source** — no reference counterpart; from-scratch, per
  the BRD's `Implementation` concept for this lesson.
- **Files affected** — modified: `Calculator.kt`.
- **Change type** — add (a new class implementing `Operation`, and a
  proof line inside `main`).
- **Location** — the class is added directly below `Operation`'s own
  declaration; the proof line is added inside `main`, immediately after
  `val calculator = Calculator(6)`.
- **Dependencies** — none beyond Concept Unit 1.

### The New Code

```kotlin
class Addition : Operation {
    override fun apply(current: Int, amount: Int): Int {
        return current + amount
    }
}
```

and, inside `main`:

```kotlin
val addition = Addition()
println(addition.apply(calculator.displayValue, 0))
```

### The Updated Project

```kotlin
1:  interface Operation {
2:      fun apply(current: Int, amount: Int): Int
3:  }
4:
5:  class Addition : Operation {         // ← new
6:      override fun apply(current: Int, amount: Int): Int {  // ← new
7:          return current + amount       // ← new
8:      }                                  // ← new
9:  }                                       // ← new
10:
11: class Calculator(var displayValue: Int) {
12:     fun add(amount: Int) {
13:         displayValue = displayValue + amount
14:     }
15:     fun subtract(amount: Int) {
16:         displayValue = displayValue - amount
17:     }
18:     fun multiply(amount: Int) {
19:         displayValue = displayValue * amount
20:     }
21:     fun divide(amount: Int) {
22:         displayValue = displayValue / amount
23:     }
24: }
25:
26: fun main() {
27:     println("Calculator starting up")
28:     val calculator = Calculator(6)
29:     val addition = Addition()               // ← new
30:     println(addition.apply(calculator.displayValue, 0))  // ← new
31:     val operandB: Int? = null
32:     val operatorSymbol = "+"
33:     val safeOperandB = operandB ?: 0
34:     when (operatorSymbol) {
35:         "+" -> calculator.add(safeOperandB)
36:         "-" -> calculator.subtract(safeOperandB)
37:         "*" -> calculator.multiply(safeOperandB)
38:         "/" -> calculator.divide(safeOperandB)
39:     }
40:     println(calculator.displayValue)
41: }
```

`Addition` now exists as a real, working implementation, proven
directly by calling it — `Calculator`'s own four Lesson-0.6 methods are
still present and still what `main`'s actual dispatch uses, untouched
until Concept Unit 4.

### Introduce the Concept in Isolation

A disposable scratch file (`verification/0.7/lab2_implementation.kt`),
continuing the BRD's own payment example from Concept Unit 1's lab:

```kotlin
interface Payment {
    fun pay(): String
}

class CreditCard : Payment {
    override fun pay(): String {
        return "Paid by credit card"
    }
}

fun main() {
    val creditCard = CreditCard()
    println(creditCard.pay())
}
```

Compiled and run this session:

```
$ kotlinc lab2_implementation.kt -include-runtime -d lab2_implementation.jar
$ java -jar lab2_implementation.jar
```

Real output:

```
Paid by credit card
```

`CreditCard`, unlike bare `Payment` in Concept Unit 1, really can be
constructed (`CreditCard()` works, where `Payment()` failed), and
calling `.pay()` on it runs real, working code. This is called
**implementing** an interface: `class CreditCard : Payment` states
that `CreditCard` satisfies `Payment`'s contract, and the `override
fun pay(): String { ... }` inside it is where that promise is actually
kept.

Two more scratch files prove the promise is genuinely enforced, not
just conventional. First,
`verification/0.7/break2a_missing_method.kt`, claiming to implement
`Payment` without providing `pay` at all:

```kotlin
interface Payment {
    fun pay(): String
}

class CreditCard : Payment

fun main() {
    val creditCard = CreditCard()
    println(creditCard.pay())
}
```

Real compiler output — this file was never run:

```
break2a_missing_method.kt:5:1: error: class 'CreditCard' is not abstract and does not implement abstract member:
fun pay(): String
class CreditCard : Payment
^^^^^^^^^^^^^^^^
```

Second, `verification/0.7/break2b_missing_override.kt`, providing a
`pay` method but leaving off the `override` keyword:

```kotlin
interface Payment {
    fun pay(): String
}

class CreditCard : Payment {
    fun pay(): String {
        return "Paid by credit card"
    }
}

fun main() {
    val creditCard = CreditCard()
    println(creditCard.pay())
}
```

Real compiler output — this file was never run either:

```
break2b_missing_override.kt:6:9: error: 'pay' hides member of supertype 'Payment' and needs an 'override' modifier.
    fun pay(): String {
        ^^^
```

Both errors prove the same contract is real from two different angles:
Kotlin refuses to compile a class that claims `: Payment` without
actually providing `pay`, and it refuses a `pay` method that isn't
explicitly marked as satisfying the interface's own — the second error
exists specifically so a method sharing a name with an interface
member by *accident* is never silently mistaken for a real
implementation of it.

### Discard the Throwaway Examples

`lab2_implementation.kt`, `break2a_missing_method.kt`, and
`break2b_missing_override.kt` are scratch, recorded in the verification
folder, not part of the calculator project. What they proved — that
implementing an interface requires a real, `override`-marked method for
every one it declares, genuinely enforced by the compiler — is exactly
what `Addition`'s own declaration, above, satisfies.

### Mechanical Walkthrough

Every distinct syntactic element in the New Code:

- **`class Addition : Operation`** — `class`, given full treatment in
  Lesson 0.6; `Addition`, an identifier; `:`, the same colon syntax
  Kotlin uses both for extending a class and for implementing an
  interface — here specifically stating **implementation** (given full
  treatment in this lesson's Header): `Addition` satisfies every
  method `Operation` declares.
- **`override fun apply(current: Int, amount: Int): Int`** —
  `override`, given full treatment in this lesson's Header, required
  here because `apply` is satisfying `Operation`'s own declared
  contract rather than introducing an unrelated new method; `fun`,
  `apply`, the parameter list, and the return type are otherwise the
  identical shape `Operation`'s own declaration used in Concept Unit
  1 — but this time with a real body.
- **`return current + amount`** — `return`, the keyword given full
  treatment in Lesson 0.2, handing back the value this method promised
  via its `: Int` return type; `current + amount`, an expression
  calling the real `Int.plus` this curriculum proved in Lesson 0.1.
- **`val addition = Addition()`** — the same `val`/`=` already given
  full treatment; `Addition()` is a constructor call, the same kind
  given full treatment in Lesson 0.6, building one real `Addition`
  object — legal here specifically because `Addition`, unlike bare
  `Operation`, is a real class with a real (implicit, no-argument)
  constructor.
- **`println(addition.apply(calculator.displayValue, 0))`** — the same
  overloaded, `inline`, `System.out.println`-delegating function given
  full treatment in this lesson's Header; `addition.apply(...)` is a
  method call, the same dot-access shape given full treatment in
  Lesson 0.6, calling `Addition`'s own real `apply` with
  `calculator.displayValue` (given full treatment in Lesson 0.6) and
  the literal `0`.

### CS Lens

Providing real, working code for a previously-declared contract, and
having that promise checked by a compiler rather than trusted by
convention, is exactly the enforcement half of the abstraction idea
Concept Unit 1's CS Lens introduced. Also recognized in: a signed
contract's actual fulfillment — the agreement states the terms, the
delivered goods or service is the implementation; a certification exam
that verifies a claimed skill is real rather than merely asserted; a
building inspector confirming construction actually matches the
approved blueprint, not just that a blueprint exists; a legal contract
requiring a signature — the specific, checkable act that turns a stated
obligation into an enforceable one.

### SE Lens

Kotlin's `override` requirement — refusing to treat a same-named method
as an implementation unless it's explicitly marked — was a deliberate
design choice, not the only possible one; some languages (including
older Java, before it added its own `@Override` annotation as an
optional check) let a method silently satisfy a supertype's contract
by name alone, with no explicit marker required. The tradeoff Kotlin's
mandatory version accepts: a small amount of extra typing on every
single implementing method, in exchange for a whole category of bug
becoming a compile error instead of a silent mismatch — a method
meant as a fresh, unrelated declaration that happens to share a name
and signature with an interface member, or a typo in a method meant to
implement one (which, without `override`, would silently compile as an
unrelated method, leaving the *real* required implementation still
missing) — both caught immediately, the way `break2b`'s real error
above already proved directly.

### Commands Needed

No new commands.

### Run It

Real output, `Calculator.kt` at its current state (verified this
session as `step2_addition_implementation.kt`):

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

The new second line, `6`, is `addition.apply(6, 0)` — `Addition`'s own
real implementation, called directly and proven correct; the final
line remains `Calculator`'s own Lesson 0.6 methods, still doing the
actual work for now.

### Connect

`Addition` is now a real, working, compiler-verified implementation of
`Operation`. The next unit adds three more, and proves what having
several different implementations of the same contract actually buys.

---

## Concept Unit: Polymorphism

### The Problem

`Addition` alone doesn't yet prove anything interesting — one
implementation of an interface could just as easily have been one
ordinary class with no interface at all. The real question is what
happens once *several* different classes all implement `Operation`,
and something else is written to work with *any* of them, through the
interface alone. Given that `Calculator`'s own methods from Lesson 0.6
each separately call `Int.plus`, `Int.minus`, `Int.times`, or
`Int.div` directly, what do you think a single method could look like
that performs *any* of the four calculator operations, if it only ever
calls `apply` on whatever `Operation` object it's handed — never
naming `Addition`, `Subtraction`, `Multiplication`, or `Division` by
name inside its own body at all? If that single method were called
once with an `Addition` object and once with a `Subtraction` object,
would you expect it to need to check, somehow, which one it received —
or could the exact same line of code just work correctly either way?

### Project Change

- **Reference Source** — no reference counterpart; from-scratch, per
  the BRD's `Polymorphism` concept for this lesson.
- **Files affected** — modified: `Calculator.kt`.
- **Change type** — add (three more `Operation` implementations and one
  new `Calculator` method) — the four Lesson-0.6 methods and `main`'s
  own dispatch logic are left untouched until Concept Unit 4.
- **Location** — the three new classes are added below `Addition`;
  `perform` is added inside `Calculator`, alongside its existing four
  methods.
- **Dependencies** — none beyond Concept Units 1–2.

### The New Code

```kotlin
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
```

and, inside `Calculator`:

```kotlin
fun perform(operation: Operation, amount: Int) {
    displayValue = operation.apply(displayValue, amount)
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
10:
11: class Subtraction : Operation {           // ← new
12:     override fun apply(current: Int, amount: Int): Int {  // ← new
13:         return current - amount            // ← new
14:     }                                        // ← new
15: }                                             // ← new
16:
17: class Multiplication : Operation {          // ← new
18:     override fun apply(current: Int, amount: Int): Int {  // ← new
19:         return current * amount              // ← new
20:     }                                          // ← new
21: }                                               // ← new
22:
23: class Division : Operation {                  // ← new
24:     override fun apply(current: Int, amount: Int): Int {  // ← new
25:         return current / amount                 // ← new
26:     }                                             // ← new
27: }                                                  // ← new
28:
29: class Calculator(var displayValue: Int) {
30:     fun add(amount: Int) {
31:         displayValue = displayValue + amount
32:     }
33:     fun subtract(amount: Int) {
34:         displayValue = displayValue - amount
35:     }
36:     fun multiply(amount: Int) {
37:         displayValue = displayValue * amount
38:     }
39:     fun divide(amount: Int) {
40:         displayValue = displayValue / amount
41:     }
42:     fun perform(operation: Operation, amount: Int) {  // ← new
43:         displayValue = operation.apply(displayValue, amount)  // ← new
44:     }                                                   // ← new
45: }
```

`Operation` now has all four real implementations this lesson needs,
and `Calculator` gains a fifth method, `perform`, existing alongside
(not yet replacing) the original four.

### Introduce the Concept in Isolation

A disposable scratch file (`verification/0.7/lab3_polymorphism.kt`),
completing the BRD's own payment example with all three implementations
and one function that works with any of them:

```kotlin
interface Payment {
    fun pay(): String
}

class CreditCard : Payment {
    override fun pay(): String {
        return "Paid by credit card"
    }
}

class PayPal : Payment {
    override fun pay(): String {
        return "Paid by PayPal"
    }
}

class Cash : Payment {
    override fun pay(): String {
        return "Paid by cash"
    }
}

fun processPayment(payment: Payment) {
    println(payment.pay())
}

fun main() {
    processPayment(CreditCard())
    processPayment(PayPal())
    processPayment(Cash())
}
```

Compiled and run this session:

```
$ kotlinc lab3_polymorphism.kt -include-runtime -d lab3_polymorphism.jar
$ java -jar lab3_polymorphism.jar
```

Real output:

```
Paid by credit card
Paid by PayPal
Paid by cash
```

`processPayment` was written exactly once, and its own body never
mentions `CreditCard`, `PayPal`, or `Cash` by name — it calls
`payment.pay()`, full stop. And yet three calls to the identical
function, with the identical shape, produced three genuinely different
real results, each one correct for the specific object actually
passed. This is called **polymorphism** — "many shapes" — and it's the
direct payoff of the **abstraction** Concept Unit 1 introduced:
`processPayment`'s parameter type, `Payment`, is all it ever needed to
know; which concrete class actually showed up at each call was decided
freshly, correctly, every single time, with zero conditional logic
inside `processPayment` itself checking which one it got.

### Discard the Throwaway Example

`lab3_polymorphism.kt` is scratch, recorded in the verification folder,
not part of the calculator project. What it proved — that one function
written against an interface behaves correctly and differently for
each real implementation it's given, with no per-type branching inside
it — is exactly what `Calculator.perform`, above, is designed to do for
the calculator's own four operations.

### Mechanical Walkthrough

Every distinct syntactic element in the New Code:

- **`class Subtraction : Operation { ... }`**,
  **`class Multiplication : Operation { ... }`**,
  **`class Division : Operation { ... }`** — the identical shape as
  `Addition` from Concept Unit 2, full treatment already given there
  and reapplied identically to each: `class`, an identifier, `:
  Operation` stating implementation, `override fun apply(current: Int,
  amount: Int): Int` providing the real body, `return` handing back the
  result of combining `current` and `amount` with the real `Int.minus`,
  `Int.times`, and `Int.div` this curriculum proved across Lessons
  0.1–0.2, respectively — differing from `Addition` in nothing but
  which operator each one's single `return` line actually uses.
- **`fun perform(operation: Operation, amount: Int)`** — `fun`, given
  full treatment in Lesson 0.2, declaring a new **method** on
  `Calculator`, given full treatment in Lesson 0.6: callable only on a
  `Calculator` object, with direct access to that object's own
  properties. `operation`, a parameter whose type is `Operation` —
  not `Addition`, not any specific implementation — meaning any real
  object satisfying that contract can be passed here, the concrete
  mechanism behind this unit's own polymorphism proof, above. `amount`,
  a second `Int` parameter, the same role Lesson 0.6's own four methods
  already gave an identically-named parameter.
- **`displayValue = operation.apply(displayValue, amount)`** —
  `displayValue`, the **implicit receiver** property given full
  treatment in Lesson 0.6, both read (as the current total) and
  reassigned (to the new one) in the same line; `=`, the same
  reassignment operator given full treatment in Lesson 0.1;
  `operation.apply(displayValue, amount)`, a method call on `operation`
  — whichever real object this specific call to `perform` was actually
  given — passing the calculator's own current total and the supplied
  `amount`. This one line is the entire reason `perform` never needs to
  know which concrete `Operation` it's holding: `apply`'s real behavior
  is entirely up to whatever object `operation` actually refers to at
  the moment this line runs.

### CS Lens

Writing one piece of code that correctly handles every current *and
future* implementation of a shared contract, without ever being
rewritten as new implementations appear, is polymorphism's actual
practical payoff, recognized across computing far beyond this one
lesson. Also recognized in: a universal remote control's single
"power" button, correctly turning off a television, a sound system, or
a streaming box, each responding to the identical button press in its
own device-specific way; a print driver interface that lets any
application send a document to any printer, regardless of manufacturer,
through one shared contract; a musical conductor's single downbeat,
correctly cueing a violin, a trumpet, and a drum, each producing
completely different sound from the identical, shared signal; a
universal power adapter's plug shape, accepted identically by devices
with completely different internal circuitry.

### SE Lens

`Calculator.perform` could have been written instead as a `when` on
some description of the operation, calling a different named method
per branch — functionally similar to what Lesson 0.6 already did, just
with an extra layer. That alternative was not chosen here: it would
require `perform`'s own body to be edited every single time a new
operation is added, exactly the kind of change interfaces and
polymorphism exist to eliminate. `perform`, as written, will work
correctly with an operation implementation that doesn't exist yet at
all — proven directly, without hypothetically, in this lesson's own
Concept Unit 4, where a brand-new `Operation` implementation works with
this exact, already-written `Calculator` with zero changes to
`Calculator` itself. The real cost of this design: understanding what
`perform(someOperation, 5)` actually *does* now requires looking at
whatever concrete class `someOperation` turns out to be at the call
site, rather than reading one self-contained method body — a real,
worthwhile tradeoff once a codebase has more than a handful of
interchangeable behaviors, and one this curriculum will keep revisiting
as its own projects grow larger.

### Commands Needed

No new commands.

### Run It

`main` itself is unchanged in this unit — its dispatch still calls
`Calculator`'s original four Lesson-0.6 methods, exactly as Concept
Unit 2's own Run It already showed, and running `Calculator.kt` right
now would reproduce that identical output. `perform` and all four
`Operation` implementations exist and are real, but nothing in `main`
calls them yet — that wiring is Concept Unit 4's own job. Per the
Verification Rule, since this unit's new code can't run standalone
inside `main` yet, this unit's Run It instead compiles and runs a
separate, fully standalone program
(`verification/0.7/step3_perform_polymorphism.kt`) built from the exact
same `Operation`/`Calculator` shape this lesson has established so
far, calling `perform` four times in a row — real proof that the
mechanism Concept Unit 4 is about to wire into `main` actually works,
before it's wired in:

```
$ kotlinc step3_perform_polymorphism.kt -include-runtime -d step3_perform_polymorphism.jar
$ java -jar step3_perform_polymorphism.jar
```

Real output:

```
Calculator starting up
10
7
14
4
```

Four calls to the identical `calculator.perform(...)` shape, each with
a different `Operation` object, correctly produced addition (`6 + 4 =
10`), subtraction (`10 - 3 = 7`), multiplication (`7 * 2 = 14`), and
truncated division (`14 / 3 = 4`) — proving `perform` genuinely works
for all four operations without any per-operation code inside it.

### Connect

`perform` now exists, proven polymorphic against all four real
operations. The last unit in this lesson wires it into `main` for
real, replacing the original four methods entirely.

---

## Concept Unit: Composition vs. Inheritance

### The Problem

`Calculator`'s four original methods from Lesson 0.6 are still present
and still what `main` actually calls — `perform` and the four new
`Operation` implementations exist, proven correct, but disconnected
from the real program. Given that `Addition : Operation` states
`Addition` *is an* `Operation` (an **implementation** relationship,
given full treatment in Concept Unit 2), and given that
`Calculator.perform` merely *receives* an `Operation` as a parameter
without extending or implementing it at all, what do you think the
actual relationship between `Calculator` and `Operation` should be
called, if it's clearly not the same "is-a" relationship `Addition` has
with it? If a brand-new fifth operation were invented tomorrow, would
you expect `Calculator`'s own class to need any changes at all to
support it?

### Project Change

- **Reference Source** — no reference counterpart; from-scratch,
  completing the BRD's `Composition vs inheritance` concept and the
  "apply the same concept to calculator operations" instruction for
  this lesson.
- **Files affected** — modified: `Calculator.kt`.
- **Change type** — remove (the four original `Calculator` methods)
  and replace (`main`'s dispatch now selects and passes an `Operation`
  object).
- **Location** — `Calculator`'s own body, and the `when` block and
  final `println` inside `main`.
- **Dependencies** — none beyond Concept Units 1–3.

### The New Code

```kotlin
val operation: Operation = when (operatorSymbol) {
    "+" -> Addition()
    "-" -> Subtraction()
    "*" -> Multiplication()
    "/" -> Division()
    else -> Addition()
}
calculator.perform(operation, safeOperandB)
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
10:
11: class Subtraction : Operation {
12:     override fun apply(current: Int, amount: Int): Int {
13:         return current - amount
14:     }
15: }
16:
17: class Multiplication : Operation {
18:     override fun apply(current: Int, amount: Int): Int {
19:         return current * amount
20:     }
21: }
22:
23: class Division : Operation {
24:     override fun apply(current: Int, amount: Int): Int {
25:         return current / amount
26:     }
27: }
28:
29: class Calculator(var displayValue: Int) {   // ← changed: four methods removed
30:     fun perform(operation: Operation, amount: Int) {
31:         displayValue = operation.apply(displayValue, amount)
32:     }
33: }
34:
35: fun main() {
36:     println("Calculator starting up")
37:     val calculator = Calculator(6)
38:     val operandB: Int? = null
39:     val operatorSymbol = "+"
40:     val safeOperandB = operandB ?: 0
41:     val operation: Operation = when (operatorSymbol) {  // ← new
42:         "+" -> Addition()                                 // ← new
43:         "-" -> Subtraction()                               // ← new
44:         "*" -> Multiplication()                             // ← new
45:         "/" -> Division()                                    // ← new
46:         else -> Addition()                                    // ← new
47:     }                                                           // ← new
48:     calculator.perform(operation, safeOperandB)                 // ← new
49:     println(calculator.displayValue)
50: }
```

`Calculator`'s four original methods — and `Addition`'s own earlier
direct-proof call from Concept Unit 2 — are gone: their teaching job is
done, and the calculator's real behavior now flows entirely through
`Operation` and `perform`.

### Introduce the Concept in Isolation

A disposable scratch file (`verification/0.7/lab4_composition.kt`),
proving the actual payoff of this lesson's whole redesign: a brand-new
`Operation` implementation, invented here for the first time, working
correctly with `Calculator` and `perform` without either one being
touched:

```kotlin
interface Operation {
    fun apply(current: Int, amount: Int): Int
}

class Calculator(var displayValue: Int) {
    fun perform(operation: Operation, amount: Int) {
        displayValue = operation.apply(displayValue, amount)
    }
}

class Average : Operation {
    override fun apply(current: Int, amount: Int): Int {
        return (current + amount) / 2
    }
}

fun main() {
    val calculator = Calculator(17)
    calculator.perform(Average(), 5)
    println(calculator.displayValue)
}
```

Compiled and run this session:

```
$ kotlinc lab4_composition.kt -include-runtime -d lab4_composition.jar
$ java -jar lab4_composition.jar
```

Real output:

```
11
```

`(17 + 5) / 2 = 11`, correct — and `Calculator`'s own class declaration
in this file is character-for-character identical to `Operation` and
`Calculator`'s shape in `Calculator.kt`'s own real project code, with
`Average` — a class this lesson has never mentioned before this exact
moment — simply working, immediately, with no edit to `Calculator`
required. This is what **composition** actually buys: `Calculator`
*has* (or, more precisely here, temporarily *uses*) an `Operation` each
time `perform` is called — a "has-a" or "uses-a" relationship — as
opposed to `Average`'s own "is-a" relationship with `Operation`,
established by `: Operation` the same way `Addition`'s was in Concept
Unit 2. `Calculator` was never written to know about `Average`
specifically, or even about the *idea* of averaging — only about the
one-method shape every `Operation` promises.

### Discard the Throwaway Example

`lab4_composition.kt` is scratch, recorded in the verification folder,
not part of the calculator project. What it proved — that
`Calculator`'s own real, unmodified shape accepts a brand-new
`Operation` implementation with zero changes — is the entire
justification for `Calculator.kt`'s own real redesign, above.

### Mechanical Walkthrough

Every distinct syntactic element in the New Code:

- **`val operation: Operation = when (operatorSymbol) { ... }`** — the
  same `val` and explicit type annotation given full treatment in
  Lesson 0.1, this time annotated `Operation` — the interface, given
  full treatment in this lesson's Header, rather than a concrete class,
  meaning `operation` can hold *any* real implementation, decided by
  which branch of the `when` expression given full treatment in Lesson
  0.3 actually matches. Each branch — `"+" -> Addition()`, and so on —
  constructs a fresh object of the matching implementation, the same
  constructor-call shape given full treatment in Concept Unit 2, above.
  The `else -> Addition()` branch is required for the identical reason
  Lesson 0.3 first proved: this `when` is assigned to a `val`, making
  it an expression that must produce a value for every possible input,
  and `operatorSymbol`'s type, `String`, can hold values none of the
  four listed branches match.
- **`calculator.perform(operation, safeOperandB)`** — a method call, the
  same dot-access shape given full treatment in Lesson 0.6, calling
  `Calculator`'s own `perform` — given full treatment in this lesson's
  Header — supplying `operation` (whichever real object the `when`
  expression above actually selected) and `safeOperandB` (the
  Elvis-defaulted value given full treatment in Lesson 0.5) as its two
  arguments.

### CS Lens

Choosing to relate two objects by one holding and using a reference to
the other, rather than one extending or implementing the other's own
type, is a foundational architectural decision recurring throughout
software design, not specific to this one interface. Also recognized
in: a car "has an" engine (composition) versus a sports car "is a"
car (inheritance/implementation) — swapping an engine for a different
model doesn't require redesigning what a car fundamentally is; a
computer "has a" keyboard it communicates with through a standard port,
never needing to be redesigned when a new keyboard model is released;
an orchestra "has" musicians it conducts through shared sheet music,
without the orchestra itself needing to be a musician; a company
department "using" an external contractor through a service agreement,
rather than that contractor becoming a permanent, structurally-fixed
part of the department.

### SE Lens

Kotlin's own design guidance — echoed across most modern
object-oriented languages — leans toward composition over inheritance
as the *default* choice specifically because of what this unit's own
lab just proved directly: a "has-a"/"uses-a" relationship (`Calculator`
holding an `Operation` reference, temporarily, per call) can be
rewired at any time — a new implementation, `Average`, worked
immediately, with zero changes to `Calculator` — while an "is-a"
relationship (`Addition : Operation`) fixes that specific class's
contract permanently, checked once at compile time and never
reconsidered. The real tradeoff: composition costs one extra level of
indirection — reading `calculator.perform(operation, amount)` requires
also knowing what `operation` actually is at that call site, a real
cost this lesson's own Polymorphism unit already named — in exchange
for exactly the flexibility this unit's lab demonstrated: new behavior
added without touching a single line of already-tested, already-shipped
code. This is precisely the property this curriculum's own BRD calls
out as the whole reason this lesson exists: "extremely useful in
Android architecture and unfamiliar codebases," where code written by
someone else, for reasons not fully known, has to be safely extended
without breaking it.

### Commands Needed

No new commands.

### Run It

Real output, `Calculator.kt`'s complete, final state for this lesson
(verified this session as `step4_final_wiring.kt`):

```
$ kotlinc Calculator.kt -include-runtime -d Calculator.jar
$ java -jar Calculator.jar
```

Real output:

```
Calculator starting up
6
```

Identical to Lesson 0.6's own final output — proving this entire
redesign changed *how* the calculator computes its result, not *what*
it actually computes.

### Connect

`Calculator` now delegates every operation through one polymorphic
`perform` method, composed with whichever real `Operation` object
`main` selects — extensible to new operations without ever touching
`Calculator` itself, proven directly by this unit's own lab. This is
the last new concept this lesson introduces.

---

## Connect the Pieces

Follow `operation` through every unit this lesson built, using
`Calculator.kt`'s real final state:

1. `main` starts (the same real JVM entry point Lesson 0.1 proved with
   `javap`) and prints `Calculator starting up`.
2. `val calculator = Calculator(6)` runs — `Calculator`, given full
   treatment in this lesson's Header, now holding only `displayValue`
   and `perform`, with no arithmetic methods of its own.
3. `operandB`, `operatorSymbol`, and `safeOperandB` are set up exactly
   as Lesson 0.5 left them.
4. `val operation: Operation = when (operatorSymbol) { ... }` runs
   (Concept Unit 4): `operatorSymbol` is `"+"`, matching the first
   branch, which constructs a real `Addition` object — an **is-a**
   relationship with `Operation`, proven by the real `override`
   requirement Concept Unit 2's own compiler errors enforced.
5. `calculator.perform(operation, safeOperandB)` runs (Concept Units
   3–4): `perform`'s own body, `displayValue = operation.apply(
   displayValue, amount)`, calls `apply` on `operation` — a **has-a** /
   **uses-a** relationship, given full treatment in Concept Unit 4 —
   without `perform`'s own code ever naming `Addition` specifically.
   `operation.apply(6, 0)` runs `Addition`'s own real implementation,
   calling the real `Int.plus` this curriculum proved in Lesson 0.1,
   returning `6`.
6. `displayValue` is reassigned to `6` — proven, by Concept Unit 3's
   own isolated lab, to work identically for `Subtraction`,
   `Multiplication`, and `Division` had `operatorSymbol` matched a
   different branch, with zero changes anywhere in `perform`'s own
   code.
7. `println(calculator.displayValue)` prints `6`.

Two lines of real, verified terminal output — `Calculator starting up`
and `6` — are the complete, observable result of a calculator whose
four operations now share one common shape, verified real by every
compiler error and every real run this lesson produced, extensible to
a fifth operation this curriculum hasn't even written yet, proven
directly rather than merely claimed. Lesson 0.8 picks this file back up
to give `Calculator`'s own data a cleaner, more idiomatic shape.
