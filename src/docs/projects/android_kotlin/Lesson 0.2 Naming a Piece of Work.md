# Lesson 0.2: Naming a Piece of Work

**What you will build.** Four real, reusable functions — `add`,
`subtract`, `multiply`, `divide` — replacing the single hand-written
`2 + 3` expression Lesson 0.1 left inside `main`. `Calculator.kt`'s
`main` function will call each one instead of computing arithmetic
directly, completing Slice 0's feature: a terminal calculator capable
of `+`, `-`, `*`, `/`. The transferable problem underneath the feature:
how to take one small computation, give it a name and a defined
input/output contract, and reuse that name everywhere the computation
is needed — instead of retyping the same expression, slightly
differently, every place it comes up.

**What you need to know first.** Lesson 0.1's `Calculator.kt`, ending
with a `main` function that declares `var displayValue = 2 + 3`, prints
it, reassigns it to `10`, and prints it again — and everything that
file's `main` depends on: `fun`, `println`, `val`/`var`, `Int`, and the
`+` operator (`Int.plus`).

**Terms used in this lesson**

- **program** — a finite sequence of instructions a computer executes,
  one after another, to produce some effect. `Calculator.kt` is still
  one program; this lesson changes what instructions are in it, not the
  fact that it's a program at all.
- **instruction** — one individual step in a program. Every line inside
  `add`, `subtract`, `multiply`, `divide`, and `main` is an instruction,
  executed in the order it's written.
- **statement** — an instruction executed for its effect, not for a
  value the rest of the program uses. `println(displayValue)` is still
  a statement in this lesson, exactly as it was in Lesson 0.1: its
  effect (text on screen) is why it runs, and nothing consumes a value
  back from it.
- **expression** — a piece of code that evaluates to a value.
  `add(2, 3)`, introduced in this lesson, is an expression exactly the
  same way `2 + 3` was in Lesson 0.1: it evaluates to `5`, and that
  value is what `var displayValue = add(2, 3)` actually stores.
- **value** — a piece of data a program holds, passes around, and
  operates on. `5`, the number `add(2, 3)` produces, is a value in
  exactly the sense Lesson 0.1 established.
- **type** — a category determining what a value's data is and what
  operations are valid on it, checked by the compiler before the
  program runs. Every parameter and return value this lesson adds has
  a type, checked exactly as strictly as Lesson 0.1 proved for `+`.
- **`fun`** — the keyword beginning a function declaration. Every
  function this lesson writes — `add`, `subtract`, `multiply`,
  `divide` — starts with it, the same keyword `main` itself already
  used in Lesson 0.1.
- **`val`** — the keyword declaring an immutable binding: a name whose
  value the compiler refuses to let be reassigned after its
  declaration. Not written directly in this lesson's own new code, but
  reappearing implicitly in `main`'s unchanged first line
  (`println("Calculator starting up")` depends on nothing declared with
  `val`, but the concept remains load-bearing background for
  understanding why `var`, below, was deliberately chosen instead for
  `displayValue`).
- **`var`** — the keyword declaring a mutable binding: a name whose
  value can be reassigned with a second `=`. `displayValue`, carried
  over unchanged from Lesson 0.1, is still declared `var` in this
  lesson, and this lesson leans on that mutability directly — every new
  Concept Unit below reassigns it to a fresh function's result.
- **`Int`** — Kotlin's type for whole numbers, with no fractional part.
  Every parameter this lesson declares, and every function's return
  value, is an `Int` — `add`, `subtract`, `multiply`, and `divide` all
  take two `Int`s and produce one.
- **type annotation (`:`)** — a colon followed by a type name, stating
  a name's type explicitly. This lesson uses it for the first time on
  something other than a `val`/`var`: a function's *parameters*, each
  written `name: Int`, plus, in this lesson's first version of `add`,
  the function's own return type.
- **type inference** — the compiler determining a `val`/`var`'s type
  from its initializing value, without an explicit annotation. This
  lesson extends the same idea to a function's *return type*: an
  expression-bodied function (below) lets the compiler infer what a
  function returns from its single expression, the same way Lesson 0.1
  showed it inferring a `val`'s type from its initializer.
- **`=` (initializer / assignment)** — the operator connecting a name on
  its left to a value on its right. This lesson reuses it for
  `displayValue`'s repeated reassignments, and introduces a second,
  related use: as the single connector in an expression-bodied
  function's declaration (`fun add(a: Int, b: Int) = a + b`), where it
  plays the same "here is the value this name produces" role for a
  function as it already plays for a `val`/`var`.
- **identifier** — a name a programmer chooses, as opposed to a
  reserved keyword. `add`, `subtract`, `multiply`, `divide`, and each
  function's parameter names (`a`, `b`) are all identifiers.
- **overload** — one of several functions sharing a name but accepting
  different argument types. `println`'s several real overloads,
  documented below, are still exactly what's called every time this
  lesson's code calls `println`.
- **parameter** — a name, declared as part of a function's signature,
  standing in for a value the function will receive each time it's
  called. It exists so a function's body can be written once, in terms
  of a placeholder name, and produce a different real result depending
  on what value is actually supplied at each call site — without a
  parameter, a function could only ever do one fixed thing with one
  fixed, hard-coded value baked into its body.
- **argument** — the actual value supplied at a specific call site for
  one of a function's parameters. `2` and `3`, in the call `add(2, 3)`,
  are arguments; `a` and `b`, in `add`'s own declaration, are
  parameters. The distinction exists because the two describe different
  moments: a parameter is part of the function's fixed *declaration*,
  written once; an argument is part of one specific *call*, and a
  function called ten times receives ten different pairs of arguments
  for the same two parameters.
- **`return`** — a keyword inside a function's body that ends the
  function immediately and hands a value back to whatever called it.
  It exists because a function's whole reason for having a return type
  is to produce a usable value for its caller — without `return` (or the
  expression-bodied form this lesson also covers), a block-bodied
  function would have no way to hand anything back at all.
- **return value** — the value a function call evaluates to, handed
  back via `return` (or an expression body). It exists so a function
  can be *used* the way `2 + 3` is used — as a value dropped directly
  into a larger expression, a `println` call, or a `val`/`var`'s
  initializer — rather than only running for a side effect.
- **expression-bodied function** — a function written as
  `fun name(params) = expression`, with no braces and no explicit
  `return`, whose single expression's value *is* the function's return
  value. It exists as a shorter, equally real alternative to a
  block-bodied function for the common case where a function's entire
  job is computing and returning one expression's value — nothing else.
- **JVM (Java Virtual Machine)** — the program that actually runs
  compiled Kotlin code, reading the `.class`/bytecode `kotlinc`
  produces. Still the same JVM every command in this lesson runs
  against, unchanged from Lesson 0.1.
- **`public`** — a Java/Kotlin visibility keyword, surfacing in this
  lesson only inside quoted real stdlib source (never written by hand
  in this lesson's own Kotlin), marking a declaration callable from any
  other code, with no restriction.

**Objects and methods used**

- **`add`**
  - *What it is:* the first new function this lesson declares — takes
    two whole numbers and produces their sum.
  - *Implementation:* first written in this lesson as a block-bodied
    function, `fun add(a: Int, b: Int): Int { return a + b }`; later in
    this same lesson refactored to the expression-bodied
    `fun add(a: Int, b: Int) = a + b`, with identical behavior proven by
    a real run in Concept Unit 2, below.
  - *Its use:* replaces `Calculator.kt`'s hand-written `2 + 3` from
    Lesson 0.1, giving the calculator's addition a name and a reusable,
    typed contract instead of a one-off inline expression.
  - *Type:* a free (top-level) function.
  - *Responsibility:* given exactly two `Int` arguments, compute and
    return their sum — nothing else; it does not print anything, store
    anything, or validate its inputs.
  - *Depends on:* two `Int` arguments supplied by whatever calls it.
  - *Connects to:* called from `main`, this lesson's own real project
    code; internally calls `Int.plus` (given full treatment below) to
    perform the actual addition.
  - *Shape:* the calculator's own domain logic — separate from `main`,
    which only orchestrates calling it and printing the result; this
    separation is this lesson's own SE Lens subject in Concept Unit 1,
    below.

- **`subtract`**
  - *What it is:* the second new function this lesson declares — takes
    two whole numbers and produces their difference.
  - *Implementation:* `fun subtract(a: Int, b: Int) = a - b`, written
    directly in expression-bodied form (the block-bodied form is not
    repeated for this function — Concept Unit 2 already proves the two
    forms behave identically).
  - *Its use:* gives the calculator's subtraction a name, the same role
    `add` plays for addition.
  - *Type:* a free (top-level) function.
  - *Responsibility:* given exactly two `Int` arguments, compute and
    return their difference (first minus second) — nothing else.
  - *Depends on:* two `Int` arguments.
  - *Connects to:* called from `main`; internally calls `Int.minus`
    (given full treatment below).
  - *Shape:* the calculator's own domain logic, the same architectural
    role as `add`.

- **`multiply`**
  - *What it is:* the third new function this lesson declares — takes
    two whole numbers and produces their product.
  - *Implementation:* `fun multiply(a: Int, b: Int) = a * b`.
  - *Its use:* gives the calculator's multiplication a name.
  - *Type:* a free (top-level) function.
  - *Responsibility:* given exactly two `Int` arguments, compute and
    return their product — nothing else.
  - *Depends on:* two `Int` arguments.
  - *Connects to:* called from `main`; internally calls `Int.times`
    (given full treatment below).
  - *Shape:* the calculator's own domain logic, the same architectural
    role as `add` and `subtract`.

- **`divide`**
  - *What it is:* the fourth new function this lesson declares — takes
    two whole numbers and produces their (truncating) quotient.
  - *Implementation:* `fun divide(a: Int, b: Int) = a / b`.
  - *Its use:* gives the calculator's division a name; this lesson
    proves, with a real run, that dividing two `Int`s truncates rather
    than producing a fractional result — a real, verified fact this
    lesson surfaces honestly rather than glossing over.
  - *Type:* a free (top-level) function.
  - *Responsibility:* given exactly two `Int` arguments, compute and
    return their integer quotient — nothing else; it does not check for
    division by zero (that check is explicitly out of scope for this
    lesson — see this unit's own SE Lens in Concept Unit 5, below).
  - *Depends on:* two `Int` arguments.
  - *Connects to:* called from `main`; internally calls `Int.div`
    (given full treatment below).
  - *Shape:* the calculator's own domain logic, the same architectural
    role as the other three.

- **`main`**
  - *What it is:* the specially-recognized function name a Kotlin
    program compiled as a standalone application is required to have —
    the running program's very first instruction executes here.
  - *Implementation:* unchanged in shape from Lesson 0.1 —
    `fun main() { }`, no parameters, no explicit return type — but its
    body's content changes across every Concept Unit in this lesson.
  - *Its use:* still the only reason `kotlinc` and the JVM know where
    this program should start running; this lesson's new functions
    (`add`, `subtract`, `multiply`, `divide`) are declared *outside*
    `main`, but only ever actually run because `main` calls them.
  - *Type:* a free (top-level) function.
  - *Responsibility:* be the single, unambiguous starting point of the
    compiled program's execution.
  - *Depends on:* nothing to be declared; to run, depends on the file
    being compiled to a `.class` the JVM can load.
  - *Connects to:* called by the JVM's own launcher machinery, external
    to this lesson's code; calls `println` and, starting this lesson,
    `add`/`subtract`/`multiply`/`divide` too.
  - *Shape:* the outermost public boundary of the whole program — and,
    starting this lesson, the orchestrator that calls this lesson's new
    domain-logic functions rather than computing their arithmetic
    itself.

- **`println`**
  - *What it is:* a Kotlin standard-library function writing text to
    standard output, then a line break.
  - *Implementation:* real source, from `kotlin-stdlib-sources.jar`
    (`jvmMain/kotlin/io/Console.kt`, package `kotlin.io`) — a family of
    overloads, unchanged from Lesson 0.1:
    ```kotlin
    /** Prints the given [message] and the line separator to the standard output stream. */
    @kotlin.internal.InlineOnly
    public inline fun println(message: Int) {
        System.out.println(message)
    }
    ```
    (The full overload set — `Any?`, `Long`, `Byte`, `Short`, `Char`,
    `Boolean`, `Float`, `Double`, `CharArray`, and a zero-argument
    `println()` — was quoted in full in Lesson 0.1; the `Int` overload
    shown here is the one every call in this lesson's own code resolves
    to, since `displayValue` is always an `Int`.)
  - *Its use:* still this lesson's only way to make anything visible —
    every Concept Unit's `Run It` step depends on it.
  - *Type:* a top-level `inline` function.
  - *Responsibility:* convert its one argument to text and write it,
    followed by a line separator, to standard output.
  - *Depends on:* exactly one argument, whose type picks the overload.
  - *Connects to:* called from `main`; internally calls
    `System.out.println` (a real method on `java.io.PrintStream`, given
    full treatment in Lesson 0.1 and unchanged here).
  - *Shape:* a public standard-library API surface, unchanged in role
    from Lesson 0.1.

- **`Int.plus`**
  - *What it is:* the real function `+` calls when both sides are
    numbers — an operator function, callable with `+` syntax instead of
    a normal `name(argument)` call.
  - *Implementation:* real source, from `kotlin-stdlib-sources.jar`
    (`commonMain/kotlin/Primitives.kt`, inside `Int`'s own `expect
    class` declaration — `expect` meaning only the signature is fixed
    here, with the real, working implementation supplied separately per
    target platform):
    ```kotlin
    /** Adds the other value to this value. */
    @kotlin.internal.IntrinsicConstEvaluation
    public operator fun plus(other: Int): Int
    ```
    No body — on the JVM, `Int` arithmetic is a compiler intrinsic: the
    compiler generates the machine-level addition directly, rather than
    compiling a real method call. Five sibling overloads exist for
    `Byte`, `Short`, `Long`, `Float`, and `Double`; there is no
    `plus(other: Boolean)`, which is why `1 + true` fails to compile (a
    fact Lesson 0.1 proved directly with the real compiler error).
  - *Its use:* `add`'s own body, `a + b`, calls this exact function.
  - *Type:* an `operator fun` (instance method) on `Int`, with no
    runnable body (a compiler intrinsic).
  - *Responsibility:* given another number, produce the sum, typed per
    its six overloads.
  - *Depends on:* the value it's called on and one argument matching
    one of its six overloads.
  - *Connects to:* invoked inside `add`'s body wherever this lesson's
    code writes `a + b`; nothing in this lesson calls `plus(...)` by its
    ordinary function-call name.
  - *Shape:* a compiler-intrinsic seam — real, declared, and bodyless.

- **`Int.minus`**
  - *What it is:* the real function `-` calls between two numbers,
    called on `subtract`'s two parameters.
  - *Implementation:* real source, from `kotlin-stdlib-sources.jar`
    (`commonMain/kotlin/Primitives.kt`, inside `Int`'s `expect class`
    declaration, fetched this session):
    ```kotlin
    /** Subtracts the other value from this value. */
    @kotlin.internal.IntrinsicConstEvaluation
    public operator fun minus(other: Int): Int
    ```
    Same shape as `Int.plus` above: no body, a compiler intrinsic on
    the JVM, with five sibling overloads (`Byte`, `Short`, `Long`,
    `Float`, `Double`) declared in the same file.
  - *Its use:* `subtract`'s own body, `a - b`, calls this exact
    function.
  - *Type:* an `operator fun` (instance method) on `Int`, bodyless.
  - *Responsibility:* given another number, subtract it from the value
    it's called on and return the difference.
  - *Depends on:* the value it's called on and one matching argument.
  - *Connects to:* invoked inside `subtract`'s body.
  - *Shape:* a compiler-intrinsic seam, the same kind as `Int.plus`.

- **`Int.times`**
  - *What it is:* the real function `*` calls between two numbers,
    called on `multiply`'s two parameters.
  - *Implementation:* real source, from `kotlin-stdlib-sources.jar`
    (`commonMain/kotlin/Primitives.kt`, inside `Int`'s `expect class`
    declaration, fetched this session):
    ```kotlin
    /** Multiplies this value by the other value. */
    @kotlin.internal.IntrinsicConstEvaluation
    public operator fun times(other: Int): Int
    ```
    Same shape again: no body, a compiler intrinsic on the JVM, five
    sibling overloads in the same file.
  - *Its use:* `multiply`'s own body, `a * b`, calls this exact
    function.
  - *Type:* an `operator fun` (instance method) on `Int`, bodyless.
  - *Responsibility:* given another number, multiply it by the value
    it's called on and return the product.
  - *Depends on:* the value it's called on and one matching argument.
  - *Connects to:* invoked inside `multiply`'s body.
  - *Shape:* a compiler-intrinsic seam, the same kind as `Int.plus` and
    `Int.minus`.

- **`Int.div`**
  - *What it is:* the real function `/` calls between two numbers,
    called on `divide`'s two parameters.
  - *Implementation:* real source, from `kotlin-stdlib-sources.jar`
    (`commonMain/kotlin/Primitives.kt`, inside `Int`'s `expect class`
    declaration, fetched this session):
    ```kotlin
    /** Divides this value by the other value, truncating the result to an integer that is closer to zero. */
    @kotlin.internal.IntrinsicConstEvaluation
    public operator fun div(other: Int): Int
    ```
    The doc comment itself states the behavior this lesson's own
    Concept Unit 5 verifies with a real run: dividing two `Int`s
    truncates toward zero rather than producing a fractional result.
    No body, a compiler intrinsic on the JVM; sibling overloads exist
    for `Byte`, `Short`, `Long` (also truncating, per the same doc
    comment pattern) and `Float`/`Double` (which do *not* truncate,
    since those types can hold a fractional result).
  - *Its use:* `divide`'s own body, `a / b`, calls this exact function.
  - *Type:* an `operator fun` (instance method) on `Int`, bodyless.
  - *Responsibility:* given another number, divide the value it's
    called on by it and return the truncated integer quotient.
  - *Depends on:* the value it's called on and one matching argument;
    behaves in a way this lesson deliberately does not yet handle when
    that argument is `0` (Stage 2's "Errors" work covers this).
  - *Connects to:* invoked inside `divide`'s body.
  - *Shape:* a compiler-intrinsic seam, the same kind as the other
    three arithmetic operators.

---

## Concept Unit: Function Declaration, Parameters, and Return Values

### The Problem

`Calculator.kt` currently computes `2 + 3` once, inline, directly inside
`main`. A real calculator needs to add *any* two numbers, not just `2`
and `3` — and it will need to do so from more than one place once this
curriculum reaches a real user interface in Stage 1. Retyping
`someNumber + someOtherNumber` everywhere addition is needed would mean
every one of those places has to be found and fixed if the addition
logic ever needs to change. Given what Lesson 0.1 already established —
that `main` is a named block of instructions the JVM knows how to find
and run — what would it look like to write a *second* named block,
separate from `main`, whose job is specifically "add two numbers"? What
would that block need to accept as input, given that it has to work for
*any* two numbers, not just `2` and `3`? What would it need to hand
back once it's done?

### Project Change

- **Reference Source** — no reference counterpart; from-scratch, per the
  BRD's `add()` practice item for this lesson.
- **Files affected** — modified: `Calculator.kt`.
- **Change type** — add (a new function, declared above `main`) and
  replace (`2 + 3` inside `main` becomes a call to that function).
- **Location** — the new function is added above `main`, at the top of
  the file; the replacement is inside `main`, on the
  `var displayValue = 2 + 3` line Lesson 0.1 left there.
- **Dependencies** — none beyond what Lesson 0.1 already established.

### The New Code

```kotlin
fun add(a: Int, b: Int): Int {
    return a + b
}
```

and, inside `main`:

```kotlin
var displayValue = add(2, 3)
```

### The Updated Project

```kotlin
1:  fun add(a: Int, b: Int): Int {  // ← new
2:      return a + b                // ← new
3:  }                                // ← new
4:
5:  fun main() {
6:      println("Calculator starting up")
7:      println(2)
8:      println(3.5)
9:      println(true)
10:     var displayValue = add(2, 3)  // ← changed: was `2 + 3`
11:     println(displayValue)
12:     displayValue = 10
13:     println(displayValue)
14: }
```

The file now declares two functions instead of one: `add`, a new,
separate named block of instructions, and `main`, which now calls `add`
instead of computing the sum itself. Everything else in `main` is
exactly as Lesson 0.1 left it.

### Introduce the Concept in Isolation

A disposable scratch file
(`verification/0.2/lab1_function_declaration.kt`), declaring a
different function than `add` — `double`, which doubles a single
number — to confirm this is a general fact about function declarations,
not something specific to `add`'s own two-parameter, addition-specific
shape:

```kotlin
fun double(n: Int): Int {
    return n + n
}

fun main() {
    println(double(4))
}
```

Compiled and run this session:

```
$ kotlinc lab1_function_declaration.kt -include-runtime -d lab1_function_declaration.jar
$ java -jar lab1_function_declaration.jar
```

Real output:

```
8
```

`double(4)` printed `8` — proving that `n`, `double`'s one **parameter**,
really did receive the actual value `4` (the **argument** at this call
site) when the function ran, and that `n + n` inside the function body
had access to that same received value twice, producing `4 + 4 = 8`.
This is called a **function declaration with parameters**: `double`'s
signature, `(n: Int)`, states that calling `double` requires supplying
one `Int`, under the name `n`, for the body to use; nothing about
`double`'s own body needs to know in advance what specific number `n`
will be — that's supplied fresh, as an argument, at each call.

### Discard the Throwaway Example

`lab1_function_declaration.kt` is scratch, recorded in the verification
folder, not part of the calculator project. What it proved — that a
declared parameter really does receive its call site's argument, usable
inside the function body — is what `add`'s own `a` and `b`, above, rely
on.

### Mechanical Walkthrough

Every distinct syntactic element in the New Code, in order:

- **`fun`** — the keyword beginning a function declaration, the same
  keyword Lesson 0.1 used to declare `main`. It tells the compiler
  unambiguously that a named, callable block of instructions follows,
  as opposed to a variable or type declaration.
- **`add`** — an identifier: the programmer-chosen name for this
  function, as opposed to a keyword the language reserves. This
  specific name was chosen, rather than something generic like `f` or
  `doStuff`, because it states exactly what the function computes —
  the same naming habit Lesson 0.1 already applied to `displayValue`,
  now applied to a function's name instead of a `val`/`var`'s.
- **`(a: Int, b: Int)`** — a parameter list: two parameters, `a` and
  `b`, each with a type annotation (`: Int`, the same colon-plus-type
  syntax Lesson 0.1 used for `val displayValue: Int`), stating that
  calling `add` requires supplying exactly two `Int` values. Unlike
  `main`'s empty `()` from Lesson 0.1, this parameter list is not empty
  — `add` cannot be called with zero arguments, or with arguments of
  the wrong type, without a compile error, for the same reason Lesson
  0.1 proved `1 + true` fails: every argument's type is checked against
  its parameter's declared type before the program runs.
- **`: Int`** (after the closing parenthesis) — a type annotation on the
  function itself, stating its *return type*: what type of value calling
  `add` produces. This is the same `:` type-annotation syntax used
  twice already in this same line (once per parameter) and already
  established for `val`/`var` in Lesson 0.1, now applied to a third
  kind of declaration.
- **`{` `}`** — a block: the boundary of `add`'s body, the same role
  Lesson 0.1 gave `main`'s own `{` `}`. Here, unlike `main`'s original
  empty block, the block contains one real instruction.
- **`return`** — a keyword ending the function's execution immediately
  and handing a value back to whatever called it. Without `return`
  here, `add`'s body would have no way to produce the `Int` its own
  `: Int` return type promises — declaring a return type without ever
  returning a value of that type is a promise the function's body has
  to keep, and `return` is how it's kept.
- **`a + b`** — an expression, the same **expression** concept Lesson
  0.1 established for `2 + 3`: `a` and `b`, reading the two parameters'
  currently-held values (per the lab above, whatever arguments this
  specific call supplied), combined with `+`, calling the real
  `Int.plus(other: Int): Int` given full treatment in this lesson's
  Header, producing a new `Int` value.
- **`add(2, 3)`** (inside `main`) — a function call: `add`, the
  identifier naming the function to call; `(2, 3)`, two `Int` literals
  supplied as arguments, positionally matched to `add`'s parameters —
  `2` becomes `a`'s value for this call, `3` becomes `b`'s. Evaluating
  this expression means running `add`'s entire body with `a` bound to
  `2` and `b` bound to `3`, which returns `5` — the same value
  `2 + 3` produced directly in Lesson 0.1, now produced by calling a
  named function instead.
- **`var displayValue = add(2, 3)`** — the same `var` keyword and `=`
  initializer operator Lesson 0.1 already gave full treatment: a
  mutable binding, named `displayValue`, initialized to whatever
  `add(2, 3)` evaluates to (`5`), with its type (`Int`) inferred from
  that value — the same type inference Lesson 0.1 proved for `2 + 3`,
  now applied to a function call's result instead of a bare expression.

### CS Lens

Giving a computation a name, a fixed set of inputs, and a defined
output — so it can be invoked the same way regardless of what specific
values it's called with — is one of the most fundamental ideas in all
of computing. Also recognized in: a mathematical function `f(x) = x²`,
defined once and evaluated at any `x`; a spreadsheet formula like
`SUM(A1:A10)`, reusable across any range you drop it into; a physical
vending machine's "insert coin, press button, receive item" contract,
identical regardless of which specific coin or item; a factory's
assembly-line station, performing the same fixed operation on whatever
part currently arrives at it.

### SE Lens

`main` could have kept computing `2 + 3` directly, with no separate
`add` function at all — Kotlin does not require breaking a program into
functions this small. That alternative was not chosen here, and the
tradeoff is concrete: a bare `2 + 3` sitting inside `main` has no name
describing what it's *for*, and if this exact computation were needed
in five different places in a larger program, each site would need its
own copy, each one a separate opportunity to introduce a subtle typo or
diverge slightly. A named function pays a small upfront cost — deciding
a name, a parameter list, a return type — in exchange for a single
place responsible for "how addition works" that every caller shares.
This lesson's calculator is still far too small to feel the second half
of that tradeoff yet, but Stage 1's real user-interface code, which
will need to call this same arithmetic from button-press handlers
rather than from a fixed sequence inside `main`, is exactly where a
single reusable `add` starts paying for itself instead of being pure
ceremony.

### Commands Needed

No new commands — the same `kotlinc ... -include-runtime -d ...` /
`java -jar ...` pair from Lesson 0.1.

### Run It

Real output, `Calculator.kt` at its current state (verified this
session as `step1_add_block_body.kt`):

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
5
10
```

Identical to Lesson 0.1's final output — proving `add(2, 3)` is a
faithful replacement for the bare `2 + 3` it replaced: the computed
value is the same, only the mechanism producing it changed.

### Connect

`add` now exists as a real, callable, typed function, and `main` uses it
instead of computing the sum inline — with identical observable
behavior, proven by the matching real output above. The next unit asks
whether `add`'s block body — braces, `return`, and all — is the only
way to write a function this simple.

---

## Concept Unit: Expression-Bodied Functions

### The Problem

`add`'s entire body is one line: `return a + b`. The braces, the
`return` keyword, and the explicit `: Int` return type are a fair
amount of surrounding ceremony for a function that does nothing but
compute and immediately hand back one expression's value. Given that
Lesson 0.1 already proved the compiler can work out a `val`'s type from
its initializer without being told (type inference), could the same
idea apply to a function's *return type* — inferring it from whatever
single expression the function computes? If `add`'s entire job is
"return `a + b`," is there anything `return` and `{ }` are doing here
that the expression `a + b` alone doesn't already say on its own?

### Project Change

- **Reference Source** — no reference counterpart; from-scratch,
  covering the BRD's "Expression-bodied functions" concept for this
  lesson.
- **Files affected** — modified: `Calculator.kt`.
- **Change type** — refactor (`add`'s block body becomes an expression
  body; behavior is unchanged, proven by the real run below).
- **Location** — the `add` function declared in Concept Unit 1, above.
- **Dependencies** — none beyond what Concept Unit 1 established.

### The New Code

```kotlin
fun add(a: Int, b: Int) = a + b
```

### The Updated Project

```kotlin
1:  fun add(a: Int, b: Int) = a + b  // ← changed: block body → expression body
2:
3:  fun main() {
4:      println("Calculator starting up")
5:      println(2)
6:      println(3.5)
7:      println(true)
8:      var displayValue = add(2, 3)
9:      println(displayValue)
10:     displayValue = 10
11:     println(displayValue)
12: }
```

`add` is now one line instead of three; `main` is completely unchanged
from Concept Unit 1 — it still calls `add(2, 3)` exactly the same way,
because `add`'s new, shorter declaration still means exactly the same
thing to any code calling it.

### Introduce the Concept in Isolation

The same throwaway function from Concept Unit 1's lab
(`verification/0.2/lab2_expression_body.kt`), `double`, rewritten in
this new shorter form, to confirm the rewrite changes nothing about
what the function actually does:

```kotlin
fun double(n: Int) = n + n

fun main() {
    println(double(4))
}
```

Compiled and run this session:

```
$ kotlinc lab2_expression_body.kt -include-runtime -d lab2_expression_body.jar
$ java -jar lab2_expression_body.jar
```

Real output:

```
8
```

Identical to Concept Unit 1's lab output for the exact same call,
`double(4)` — proving the rewrite is purely a change in how the
function is *written*, not in what it *does*. This shorter form is
called an **expression-bodied function**: `= n + n` replaces `{ return
n + n }` entirely, and `double`'s return type — never written here at
all — is inferred by the compiler from what `n + n` evaluates to
(`Int`, per the real `Int.plus(other: Int): Int` signature this
lesson's Header quotes), the same type inference Lesson 0.1 already
proved for a `val`'s type.

### Discard the Throwaway Example

`lab2_expression_body.kt` is scratch, recorded in the verification
folder, not part of the calculator project. What it proved — that an
expression body behaves identically to an equivalent block body — is
why `add`'s own rewrite, above, is safe.

### Mechanical Walkthrough

Every distinct syntactic element in the New Code, compared against
Concept Unit 1's version:

- **`fun add(a: Int, b: Int)`** — unchanged from Concept Unit 1: the
  same `fun` keyword, the same identifier `add`, the same two `Int`
  parameters with their type annotations. Full treatment for each of
  these was already given in Concept Unit 1's walkthrough and applies
  identically here — only what comes after the parameter list has
  changed.
- **(absence of `: Int`)** — there is no longer an explicit return-type
  annotation. This is exactly what makes the compiler infer `add`'s
  return type from its body's single expression, the same mechanism the
  isolated lab above just proved for `double`.
- **`=`** — the same initializer operator Lesson 0.1 gave full
  treatment for `val`/`var`, reused here in a new role: connecting a
  function's declaration to the single expression that *is* its entire
  body and its return value, in one piece of syntax, rather than a
  separate `{ return ... }` block.
- **`a + b`** — the same expression as Concept Unit 1's version, still
  resolving through the real, bodyless `Int.plus(other: Int): Int`
  intrinsic quoted in this lesson's Header — unchanged in what it
  computes, only in the syntax surrounding it.

### CS Lens

Offering a shorter, equivalent syntax for the common case of "this
whole function is one expression" — while keeping the longer, more
general form available for anything that needs more than one
instruction — is not specific to Kotlin. Also recognized in: JavaScript
arrow functions written as `x => x * x` instead of
`function(x) { return x * x; }`; Python's `lambda x: x * x`; a math
textbook writing `f(x) = x²` rather than a multi-line procedure for
something that's genuinely just one formula; C#'s expression-bodied
members, offering the exact same shorthand for methods and properties
whose entire job is one expression.

### SE Lens

Kotlin offers both forms rather than forcing every function into one
style — the tradeoff is legibility versus room to grow. An
expression-bodied function states, at a glance, "this function is
exactly one computation, nothing more" — a reader never has to scan for
a stray second `return` or a side effect hiding in the body, because the
syntax itself rules that out. The cost: the moment a function needs more
than one instruction (validating an input before computing, logging
something, branching on a condition — all real needs Stage 2's error
handling will introduce), an expression body can no longer express it,
and the function has to go back to the block-bodied form Concept Unit 1
used. This lesson chooses the expression-bodied form for `add` and the
three functions that follow specifically because each one's entire job,
for now, really is one arithmetic expression — a judgment call this
curriculum will revisit the moment that stops being true.

### Commands Needed

No new commands.

### Run It

Real output, `Calculator.kt` at its current state (verified this
session as `step2_add_expression_body.kt`):

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
5
10
```

Identical to Concept Unit 1's output — confirming, a second way, that
rewriting `add` as an expression-bodied function changed nothing about
`Calculator.kt`'s actual behavior.

### Connect

`add` is now written in its final, shorter form, with no observable
change in behavior. The next unit gives subtraction the same treatment
`add` just received, introducing a new operator in the process.

---

## Concept Unit: Subtraction and `Int.minus`

### The Problem

`add` gives the calculator addition. A calculator advertised as capable
of `+`, `-`, `*`, `/` (this lesson's own opening statement) still has
three operations missing. Given `add`'s finished shape —
`fun add(a: Int, b: Int) = a + b` — and given that Kotlin's subtraction
operator is `-` (the same familiar symbol used outside programming),
what would you guess a `subtract` function's entire declaration looks
like, before reading any further? What single character would need to
change from `add`'s own declaration?

### Project Change

- **Reference Source** — no reference counterpart; from-scratch, per
  the BRD's `subtract()` practice item.
- **Files affected** — modified: `Calculator.kt`.
- **Change type** — add (a new function) and replace (the
  `displayValue = 10` reassignment from Lesson 0.1 becomes a real
  subtraction, reusing `displayValue`'s current value as an input).
- **Location** — the new function is added directly below `add`; the
  replacement is inside `main`, on the `displayValue = 10` line.
- **Dependencies** — none beyond Concept Units 1–2.

### The New Code

```kotlin
fun subtract(a: Int, b: Int) = a - b
```

and, inside `main`:

```kotlin
displayValue = subtract(displayValue, 4)
```

### The Updated Project

```kotlin
1:  fun add(a: Int, b: Int) = a + b
2:  fun subtract(a: Int, b: Int) = a - b  // ← new
3:
4:  fun main() {
5:      println("Calculator starting up")
6:      println(2)
7:      println(3.5)
8:      println(true)
9:      var displayValue = add(2, 3)
10:     println(displayValue)
11:     displayValue = subtract(displayValue, 4)  // ← changed: was `displayValue = 10`
12:     println(displayValue)
13: }
```

`displayValue` no longer gets overwritten with an arbitrary `10` — it's
now reassigned to a real computed result, using its own current value
(`5`, from `add`) as one of `subtract`'s two arguments.

### Introduce the Concept in Isolation

A disposable scratch file (`verification/0.2/lab3_subtract.kt`), using
a differently-named function and different arguments than the real
project code, to confirm the pattern generalizes:

```kotlin
fun difference(a: Int, b: Int) = a - b

fun main() {
    println(difference(10, 4))
}
```

Compiled and run this session:

```
$ kotlinc lab3_subtract.kt -include-runtime -d lab3_subtract.jar
$ java -jar lab3_subtract.jar
```

Real output:

```
6
```

`10 - 4` correctly produces `6` — proving `-` between two `Int`s calls a
real, working subtraction, the same way Lesson 0.1 proved `+` calls a
real addition. This confirms `-` resolves to `Int.minus`, given full
treatment in this lesson's Header: a compiler intrinsic, bodyless on
the JVM, declared with the identical shape as `Int.plus` — six
overloads (`Byte`, `Short`, `Int`, `Long`, `Float`, `Double`), no
`Boolean` overload, meaning `subtract`'s two `Int` parameters are
exactly as type-checked as `add`'s were.

### Discard the Throwaway Example

`lab3_subtract.kt` is scratch, recorded in the verification folder, not
part of the calculator project. What it proved — that `-` really
performs subtraction between two `Int`s — is what `subtract`'s own
body, above, relies on.

### Mechanical Walkthrough

Every distinct syntactic element in the New Code:

- **`fun subtract(a: Int, b: Int) = a - b`** — `fun` begins the function
  declaration; `subtract` is its identifier; `(a: Int, b: Int)` declares
  two parameters, each type-annotated `Int`, stating that calling
  `subtract` requires exactly two whole numbers; the `=` is the same
  initializer-flavored operator an expression-bodied function uses in
  place of a block body, meaning `subtract`'s return type is inferred
  as `Int` from what `a - b` evaluates to, rather than written by hand.
  Every one of these facts is identical to `add`'s own finished
  declaration from Concept Unit 2 — only the identifier (`subtract`
  instead of `add`) and the operator inside the body actually differ.
- **`a - b`** — an expression: `a` and `b`, reading `subtract`'s two
  parameters' currently-held values, combined with `-`, calling the
  real `Int.minus(other: Int): Int` given full treatment in this
  lesson's Header — a compiler intrinsic with the identical bodyless
  shape as `Int.plus`, just performing subtraction instead of addition.
- **`displayValue = subtract(displayValue, 4)`** — a reassignment,
  legal because `displayValue` is declared `var` (given full treatment
  in this lesson's Header, and proven enforced by Lesson 0.1's real
  `'val' cannot be reassigned` error for the opposite case). The
  right-hand side, `subtract(displayValue, 4)`, is a function call:
  `displayValue`'s *current* value at the moment this line runs (`5`,
  set by the `add` call two lines earlier) becomes `subtract`'s `a`;
  the literal `4` becomes its `b`. This is the same kind of function
  call as `add(2, 3)` from Concept Unit 1, just with one argument being
  a name's current value instead of a literal.

### CS Lens

Reusing the exact same declaration pattern for a second, related
operation — changing only the one piece that's actually different — is
a recognizable habit across programming, not unique to this lesson.
Also recognized in: a set of related database queries (`getById`,
`getByName`) sharing a near-identical shape, differing only in the
condition; a family of math functions (`sin`, `cos`, `tan`) sharing an
identical signature and differing only in which trigonometric ratio
each computes; a suite of unit tests where nine out of ten lines are
identical boilerplate and the tenth line is the one actual assertion
under test.

### SE Lens

`subtract` could have been written to reuse `add` internally — for
instance, `fun subtract(a: Int, b: Int) = add(a, -b)` — rather than
calling `Int.minus` directly. That alternative was not chosen here: it
would work correctly, but it would hide what `subtract` actually does
behind an extra layer of indirection, and it would make `subtract`
depend on `add`'s continued existence and behavior for no real benefit
— `Int.minus` is exactly as fundamental and exactly as available as
`Int.plus`, so reaching directly for it costs nothing and keeps
`subtract`'s own logic self-evident from reading its own one line.

### Commands Needed

No new commands.

### Run It

Real output, `Calculator.kt` at its current state (verified this
session as `step3_subtract.kt`):

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
5
1
```

The last line changed from Lesson 0.1's arbitrary `10` to a real
computed `1` — `5 - 4`, using `add`'s own result as an input to
`subtract`.

### Connect

`displayValue` now flows through two real functions in sequence: `add`
produced `5`, and `subtract` consumed that `5` to produce `1`. The next
unit adds a third operation to the same chain.

---

## Concept Unit: Multiplication and `Int.times`

### The Problem

Two of the calculator's four advertised operations now exist. Given
`subtract`'s declaration — `fun subtract(a: Int, b: Int) = a - b` — and
Kotlin's multiplication operator, `*`, what would `multiply`'s
declaration look like? What would you expect
`displayValue = multiply(displayValue, 5)` to compute, given that
`displayValue` currently holds `1` at the point this new line would run
(the real, verified result Concept Unit 3 just produced)?

### Project Change

- **Reference Source** — no reference counterpart; from-scratch, per
  the BRD's `multiply()` practice item.
- **Files affected** — modified: `Calculator.kt`.
- **Change type** — add (a new function and two new lines inside
  `main`).
- **Location** — the new function is added directly below `subtract`;
  the new lines are added inside `main`, immediately after the
  `println(displayValue)` that follows the `subtract` call.
- **Dependencies** — none beyond Concept Units 1–3.

### The New Code

```kotlin
fun multiply(a: Int, b: Int) = a * b
```

and, inside `main`:

```kotlin
displayValue = multiply(displayValue, 5)
println(displayValue)
```

### The Updated Project

```kotlin
1:  fun add(a: Int, b: Int) = a + b
2:  fun subtract(a: Int, b: Int) = a - b
3:  fun multiply(a: Int, b: Int) = a * b  // ← new
4:
5:  fun main() {
6:      println("Calculator starting up")
7:      println(2)
8:      println(3.5)
9:      println(true)
10:     var displayValue = add(2, 3)
11:     println(displayValue)
12:     displayValue = subtract(displayValue, 4)
13:     println(displayValue)
14:     displayValue = multiply(displayValue, 5)  // ← new
15:     println(displayValue)                      // ← new
16: }
```

`main` now chains three operations in sequence, each reusing
`displayValue`'s own running result as one of the next call's
arguments, then printing the new result each time.

### Introduce the Concept in Isolation

A disposable scratch file (`verification/0.2/lab4_multiply.kt`), using
a differently-named function and different arguments:

```kotlin
fun product(a: Int, b: Int) = a * b

fun main() {
    println(product(3, 5))
}
```

Compiled and run this session:

```
$ kotlinc lab4_multiply.kt -include-runtime -d lab4_multiply.jar
$ java -jar lab4_multiply.jar
```

Real output:

```
15
```

`3 * 5` correctly produces `15` — proving `*` between two `Int`s
performs real multiplication, resolving to `Int.times`, given full
treatment in this lesson's Header: the same compiler-intrinsic,
bodyless shape as `Int.plus` and `Int.minus`, with the identical
six-overload pattern (`Byte`, `Short`, `Int`, `Long`, `Float`, `Double`,
no `Boolean`).

### Discard the Throwaway Example

`lab4_multiply.kt` is scratch, recorded in the verification folder, not
part of the calculator project. What it proved — that `*` performs real
multiplication between two `Int`s — is what `multiply`'s own body,
above, relies on.

### Mechanical Walkthrough

Every distinct syntactic element in the New Code:

- **`fun multiply(a: Int, b: Int) = a * b`** — `fun` begins the function
  declaration; `multiply` is its identifier; `(a: Int, b: Int)` declares
  two `Int`-typed parameters; the `=` marks this as an expression-bodied
  function, its return type inferred as `Int` from `a * b` rather than
  written explicitly — every one of these facts identical to `add` and
  `subtract`'s own declarations, only the identifier and operator
  differ. `a * b` is an expression calling the real
  `Int.times(other: Int): Int`, given full treatment in this lesson's
  Header — a bodyless compiler intrinsic, the same shape as `Int.plus`
  and `Int.minus`, performing multiplication instead.
- **`displayValue = multiply(displayValue, 5)`** — a reassignment: `=`
  is the same operator that both initializes a `val`/`var` and connects
  an expression-bodied function to its return value, here used in its
  reassignment role, legal because `displayValue` was declared `var`, a
  mutable binding the compiler allows a second `=` to target.
  `displayValue`'s current value (`1`, set by the `subtract` call
  immediately above) becomes `multiply`'s `a`; the literal `5` becomes
  its `b`.
- **`println(displayValue)`** — the same overloaded, `inline`,
  `System.out.println`-delegating function given full treatment in this
  lesson's Header, called again; `displayValue` is still an `Int`
  (`multiply` returns `Int`, the same as every function in this
  lesson), resolving this call to the `println(message: Int)` overload.

### CS Lens

A running value threaded through a sequence of named operations, each
one consuming the previous step's output as its own input, is a
recognizable shape well beyond this one calculator. Also recognized in:
a factory assembly line, where each station's output becomes the next
station's input; Unix shell pipelines (`cat file | grep x | sort`),
where each command's output is the next command's input; a mathematical
composition `h(x) = g(f(x))`, where `f`'s result feeds directly into
`g`.

### SE Lens

`main`'s three calls so far — `add`, then `subtract`, then `multiply`,
each reusing `displayValue`'s current value — mirror exactly how a real
calculator app works: a running display value, updated by whichever
operation the user presses next. The alternative would be storing each
intermediate result under a separate name (`val sum = add(2, 3)`,
`val difference = subtract(sum, 4)`, and so on) — more names, each used
exactly once, adding no real clarity for a value that's genuinely meant
to be a single running total. Reusing one mutable `displayValue`,
declared `var` specifically so this reuse is legal, is the more honest
representation of what a calculator's display actually is: one number
that keeps changing, not a growing list of every intermediate result
ever computed.

### Commands Needed

No new commands.

### Run It

Real output, `Calculator.kt` at its current state (verified this
session as `step4_multiply.kt`):

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
5
1
5
```

`1 * 5 = 5` — the new last line, confirming `multiply` correctly
consumed `subtract`'s own result.

### Connect

Three of the calculator's four operations now run in sequence through
`displayValue`. The last unit completes the set — and surfaces a real
fact about `Int` arithmetic this lesson has deliberately saved for
last.

---

## Concept Unit: Division and `Int.div`

### The Problem

The fourth operation, division, is different from the other three in a
way that matters concretely: `7` divided by `2` is `3.5` in ordinary
arithmetic, but `displayValue` — and every parameter and return value
this lesson has declared — is `Int`, Kotlin's whole-number type, which
cannot hold a fractional part at all. Given that constraint, what do
you think `7 / 2` actually produces when both `7` and `2` are `Int`
literals — a rounded `4`, a truncated `3`, or something else? Does
Kotlin refuse to compile `Int` division at all, the way it refused
`1 + true`, or does it produce some real `Int` result?

### Project Change

- **Reference Source** — no reference counterpart; from-scratch, per
  the BRD's `divide()` practice item.
- **Files affected** — modified: `Calculator.kt`.
- **Change type** — add (a new function and two new lines inside
  `main`).
- **Location** — the new function is added directly below `multiply`;
  the new lines are added inside `main`, immediately after the
  `println(displayValue)` that follows the `multiply` call.
- **Dependencies** — none beyond Concept Units 1–4.

### The New Code

```kotlin
fun divide(a: Int, b: Int) = a / b
```

and, inside `main`:

```kotlin
displayValue = divide(displayValue, 3)
println(displayValue)
```

### The Updated Project

```kotlin
1:  fun add(a: Int, b: Int) = a + b
2:  fun subtract(a: Int, b: Int) = a - b
3:  fun multiply(a: Int, b: Int) = a * b
4:  fun divide(a: Int, b: Int) = a / b  // ← new
5:
6:  fun main() {
7:      println("Calculator starting up")
8:      println(2)
9:      println(3.5)
10:     println(true)
11:     var displayValue = add(2, 3)
12:     println(displayValue)
13:     displayValue = subtract(displayValue, 4)
14:     println(displayValue)
15:     displayValue = multiply(displayValue, 5)
16:     println(displayValue)
17:     displayValue = divide(displayValue, 3)  // ← new
18:     println(displayValue)                    // ← new
19: }
```

All four operations the BRD's Slice 0 feature calls for — `+`, `-`,
`*`, `/` — now exist as named, callable functions, each used in
sequence inside `main`.

### Introduce the Concept in Isolation

A disposable scratch file (`verification/0.2/lab5_divide.kt`), checking
division with a case where the mathematically exact answer is *not* a
whole number, plus a negative case, to see exactly what `Int` division
actually does rather than guessing:

```kotlin
fun quotient(a: Int, b: Int) = a / b

fun main() {
    println(quotient(7, 2))
    println(quotient(-7, 2))
}
```

Compiled and run this session:

```
$ kotlinc lab5_divide.kt -include-runtime -d lab5_divide.jar
$ java -jar lab5_divide.jar
```

Real output:

```
3
-3
```

`7 / 2` produced `3`, not `3.5` and not a rounded `4` — Kotlin does not
refuse to compile `Int` division, and it does not silently switch to a
fractional type either; it computes the mathematically exact result and
**truncates** it, discarding whatever comes after the decimal point,
down to `3`. The second line proves *which direction* truncation goes
for a negative result: `-7 / 2` is exactly `-3.5`, and the real output
is `-3`, not `-4` — truncation here means "toward zero," not "always
round down." This matches this lesson's Header exactly: the real
`Int.div` source's own doc comment states "truncating the result to an
integer that is closer to zero," and `-3` is closer to zero than `-4`
is. This is called **integer division**: division between two whole
numbers that itself produces a whole number, by discarding any
fractional remainder rather than keeping it.

### Discard the Throwaway Example

`lab5_divide.kt` is scratch, recorded in the verification folder, not
part of the calculator project. What it proved — that `Int` division
truncates toward zero rather than rounding or refusing to compile — is
exactly the behavior `divide`'s own body, above, has.

### Mechanical Walkthrough

Every distinct syntactic element in the New Code:

- **`fun divide(a: Int, b: Int) = a / b`** — `fun` begins the function
  declaration; `divide` is its identifier; `(a: Int, b: Int)` declares
  two `Int`-typed parameters, checked at every call the same way every
  other parameter in this lesson has been; the `=` marks this as an
  expression-bodied function, its return type inferred as `Int` — every
  one of these facts identical to the other three functions' own
  declarations. `a / b` is an expression calling the real
  `Int.div(other: Int): Int`, given full treatment in this lesson's
  Header — a bodyless compiler intrinsic with the same six-overload
  shape as the other three arithmetic operators, whose real doc comment
  is the direct source for the truncation behavior the lab above just
  proved.
- **`displayValue = divide(displayValue, 3)`** — a reassignment: `=`
  targeting `displayValue`, legal because it was declared `var`, a
  mutable binding the compiler allows a second `=` to target.
  `displayValue`'s current value (`5`, set by the `multiply` call
  immediately above) becomes `divide`'s `a`; the literal `3` becomes its
  `b`. `5 / 3` is exactly `1.666...`; per the real behavior the lab
  above proved, this truncates to `1`.
- **`println(displayValue)`** — the same overloaded, `inline`,
  `System.out.println`-delegating function given full treatment in this
  lesson's Header, called a final time; `displayValue` is still an
  `Int`, resolving this call to the `println(message: Int)` overload.

### CS Lens

A whole-number type that cannot represent a fraction, and an integer
division operation that has to decide, by some fixed, documented rule,
what to do with a result that mathematically has one, is not unique to
Kotlin. Also recognized in: C and Java's own `int` division, truncating
toward zero using the identical rule Kotlin's real doc comment states;
a physical box of eggs, where "24 eggs into cartons of 6" divides
evenly but "25 eggs into cartons of 6" leaves a real, physical
remainder that "4.1666 cartons" doesn't meaningfully describe; a clock
face's twelve-hour arithmetic, where every calculation lands on a whole
hour by rule, never a fractional one; a `//` floor-division operator in
Python, solving the identical underlying problem with a different
rounding rule (always toward negative infinity, not toward zero) —
proving this is a genuine design choice with more than one defensible
answer, not an obvious inevitability.

### SE Lens

Kotlin could have made `/` between two `Int`s a compile error, the way
it makes `1 + true` one — forcing every division to explicitly convert
to `Double` first. That alternative was not chosen: integer division
that truncates is useful and common enough (splitting a whole quantity
into whole groups, as the egg-carton example above shows) that requiring
an explicit conversion for every single use would be a constant tax on
by far the more common case. The real cost of the choice Kotlin did
make: a division that silently discards a fractional part can hide a
genuine bug if a programmer forgot they were working with `Int`s and
expected a precise fractional answer — nothing about `5 / 3` evaluating
to `1` looks like an error, and this lesson deliberately does not paper
over that by rounding or warning; it shows the real, sometimes-surprising
behavior plainly, so it's a known fact rather than a future surprise.
This lesson's `divide` is also deliberately incomplete in one specific,
named way: it does nothing special when its second argument is `0` —
Kotlin does not catch that at compile time the way it catches a type
mismatch, and this lesson is not yet equipped to handle it, because
Stage 2 ("Trustworthy Calculator," specifically its "Errors" work) is
where this curriculum teaches error handling as its own subject. Leaving
it unhandled here is a real, acknowledged gap in this lesson's own
`divide`, not an oversight.

### Commands Needed

No new commands.

### Run It

Real output, `Calculator.kt`'s complete, final state for this lesson
(verified this session as `step5_divide.kt`):

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
5
1
5
1
```

### Connect

All four operations now run in sequence through `displayValue`: `5`,
`1`, `5`, `1` — each one a real function call, each one type-checked,
each one proven against real compiler and runtime evidence rather than
assumed. This is the last new concept this lesson introduces.

---

## Connect the Pieces

Follow `displayValue` through every function this lesson built, using
`Calculator.kt`'s real final state:

1. `main` starts (the same real, JVM-recognized entry point Lesson 0.1
   proved with `javap`), and runs its first four `println` calls
   unchanged from Lesson 0.1, producing `Calculator starting up`, `2`,
   `3.5`, and `true`.
2. `var displayValue = add(2, 3)` runs (Concept Units 1–2): `add`,
   declared as `fun add(a: Int, b: Int) = a + b`, receives arguments
   `2` and `3` as its parameters `a` and `b`, calls the real
   `Int.plus(other: Int): Int` from this lesson's Header, and returns
   `5`. `displayValue` is declared `var` and initialized to that `5`,
   its type inferred as `Int`.
3. `println(displayValue)` prints `5`.
4. `displayValue = subtract(displayValue, 4)` runs (Concept Unit 3):
   `displayValue`'s current value, `5`, becomes `subtract`'s `a`; `4`
   becomes its `b`. `subtract` calls the real `Int.minus`, returning
   `1`. Because `displayValue` is `var`, not `val`, this reassignment is
   legal — proven, by contrast, against Lesson 0.1's real
   `'val' cannot be reassigned` error for the same pattern under `val`.
5. `println(displayValue)` prints `1`.
6. `displayValue = multiply(displayValue, 5)` runs (Concept Unit 4):
   `1` becomes `multiply`'s `a`; `5` becomes its `b`. `multiply` calls
   the real `Int.times`, returning `5`.
7. `println(displayValue)` prints `5`.
8. `displayValue = divide(displayValue, 3)` runs (Concept Unit 5): `5`
   becomes `divide`'s `a`; `3` becomes its `b`. `divide` calls the real
   `Int.div`, whose own doc comment states it truncates toward zero —
   proven with a real run against `7 / 2` and `-7 / 2` in this unit's
   own lab — returning `1`, the truncated result of `5 / 3`.
9. `println(displayValue)` prints `1`.

Eight lines of real, verified terminal output —
`Calculator starting up`, `2`, `3.5`, `true`, `5`, `1`, `5`, `1` — are
the complete, observable result of every function this lesson wrote.
Lesson 0.3 picks this file back up to let the calculator choose *which*
of these four operations to run, instead of always running all four in
the same fixed order.
