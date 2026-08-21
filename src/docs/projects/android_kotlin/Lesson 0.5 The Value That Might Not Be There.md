# Lesson 0.5: The Value That Might Not Be There

**What you will build.** `Calculator.kt` gains a second operand that
honestly represents "not entered yet" instead of silently standing in
for a real number — and the calculator keeps working correctly anyway,
by explicitly handling the case where that value is absent. Every value
this curriculum has worked with so far has been guaranteed to actually
be there: an `Int` was always some real whole number, never "maybe a
number, maybe nothing." This lesson's transferable problem is what a
program does the moment that guarantee stops holding — when a value
that's supposed to exist genuinely might not.

**What you need to know first.** `Calculator.kt` as Lesson 0.3 left it:
`add`/`subtract`/`multiply`/`divide`, `operandA`/`operandB`/
`operatorSymbol`, and the `when` expression choosing which function to
call. Also `Int`, `val`, and `println`, from Lessons 0.1–0.2.

**Terms used in this lesson**

- **program** — a finite sequence of instructions a computer executes
  in order. This lesson's whole subject is instructions that have to
  account for a value that might not be there, before running the ones
  that assumed it would be.
- **value** — a piece of data a program holds and operates on. This
  lesson is about a specific complication a value can have: not being
  guaranteed to hold real data at all.
- **type** — a category determining what a value's data is and what
  operations are valid on it, checked by the compiler before the
  program runs. This lesson adds a new dimension to that category: not
  just *what kind* of data a value holds, but *whether it's guaranteed
  to hold any at all*.
- **`val`** — the keyword declaring an immutable binding: a name whose
  value the compiler refuses to let be reassigned. Every new name this
  lesson declares (`pendingOperand`, `safeOperandB`) is a `val`, the
  same immutability guarantee Lesson 0.1 proved is compiler-enforced.
- **`Int`** — Kotlin's type for whole numbers, given full treatment in
  Lesson 0.1. This lesson's whole subject only exists because of the
  contrast between plain `Int` (below) and `Int?` (also below) — two
  genuinely different types, not one type with an optional extra rule.
- **`fun`** — the keyword beginning a function declaration, unchanged
  from Lesson 0.2; `add`, `subtract`, `multiply`, and `divide` still
  begin with it.
- **null** — a real, distinct value meaning "no value is here" —
  neither `0`, nor an empty piece of text, nor `false`, but the
  deliberate absence of any of Kotlin's ordinary values. It exists
  because a program genuinely needs a way to represent "nothing was
  provided" that's distinguishable from every real answer a value could
  actually hold — `0` is a legitimate number a user might really type;
  `null` means no number was typed at all.
- **nullable type (`?`)** — a question mark written directly after a
  type name (`Int?`, not `Int`), stating that a value of this type is
  either a real value of the named type, or `null`. It exists so the
  compiler can track, and check, exactly which values in a program are
  guaranteed to be real and which ones genuinely might be absent —
  proven directly, with real compiler errors, in Concept Unit 1, below.
- **safe call (`?.`)** — a period preceded by a question mark, calling a
  method or reading a property on a nullable value without crashing if
  that value turns out to be `null`. It exists so code can attempt to
  use a nullable value's members without first writing a separate
  `if (x != null)` check by hand every single time — if the value is
  `null`, the whole safe-called expression simply evaluates to `null`
  itself, instead of running the call at all.
- **Elvis operator (`?:`)** — two characters, a question mark and a
  colon, supplying a fallback value to use when the expression on its
  left turns out to be `null`. It exists so a nullable value can be
  converted into a guaranteed real one, with an explicit, visible
  fallback chosen deliberately by the programmer, rather than a program
  either crashing on `null` or silently treating it as some arbitrary
  default no reader could predict from the code alone.
- **non-null assertion (`!!`)** — two exclamation marks after a nullable
  value, telling the compiler "trust me, this is not actually null
  right now" — and, if that trust turns out to be misplaced, crashing
  the program immediately instead of continuing. It exists as an escape
  hatch for the rare case a programmer is certain a nullable value is
  actually present, at the cost of turning that certainty into an
  unchecked promise the compiler can no longer verify on your behalf.

**Objects and methods used**

- **`add`**
  - *What it is:* the addition function this lesson calls with a
    now-guaranteed-safe second operand, unchanged from Lesson 0.2.
  - *Implementation:* unchanged — `fun add(a: Int, b: Int): Int`,
    requiring two plain (non-nullable) `Int` arguments; this
    requirement is exactly what this lesson's whole problem revolves
    around, once `operandB` itself becomes nullable.
  - *Its use:* called from this lesson's `when` expression with
    `safeOperandB`, this lesson's own fallback-guaranteed value, not
    the raw nullable `operandB` directly.
  - *Type:* a free (top-level) function.
  - *Responsibility:* given two `Int` arguments, compute and return
    their sum.
  - *Depends on:* two plain `Int` arguments — it has no way to accept
    an `Int?`, proven directly by this lesson's own real compiler error
    in Concept Unit 3, below.
  - *Connects to:* called from this lesson's `when` expression, the
    same call site Lesson 0.3 established.
  - *Shape:* the calculator's own domain logic, unchanged in role.

- **`subtract`**
  - *What it is:* the subtraction function from Lesson 0.2, called with
    `safeOperandB` exactly the same way `add` is.
  - *Implementation:* unchanged from Lesson 0.2 —
    `fun subtract(a: Int, b: Int): Int`, requiring two plain `Int`
    arguments, the identical requirement `add` has.
  - *Its use:* selected by this lesson's unchanged `when` expression
    when `operatorSymbol` is `"-"`.
  - *Type:* a free (top-level) function.
  - *Responsibility:* given two `Int` arguments, compute and return
    their difference.
  - *Depends on:* two plain `Int` arguments.
  - *Connects to:* called from this lesson's `when` expression.
  - *Shape:* the calculator's own domain logic, unchanged in role.

- **`multiply`**
  - *What it is:* the multiplication function from Lesson 0.2, called
    with `safeOperandB` exactly the same way `add` is.
  - *Implementation:* unchanged from Lesson 0.2 —
    `fun multiply(a: Int, b: Int): Int`, requiring two plain `Int`
    arguments, the identical requirement `add` has.
  - *Its use:* selected by this lesson's unchanged `when` expression
    when `operatorSymbol` is `"*"`.
  - *Type:* a free (top-level) function.
  - *Responsibility:* given two `Int` arguments, compute and return
    their product.
  - *Depends on:* two plain `Int` arguments.
  - *Connects to:* called from this lesson's `when` expression.
  - *Shape:* the calculator's own domain logic, unchanged in role.

- **`divide`**
  - *What it is:* the division function from Lesson 0.2, called with
    `safeOperandB` exactly the same way `add` is.
  - *Implementation:* unchanged from Lesson 0.2 —
    `fun divide(a: Int, b: Int): Int`, requiring two plain `Int`
    arguments, the identical requirement `add` has, and still
    truncating toward zero, per Lesson 0.2's own real proof.
  - *Its use:* selected by this lesson's unchanged `when` expression
    when `operatorSymbol` is `"/"`.
  - *Type:* a free (top-level) function.
  - *Responsibility:* given two `Int` arguments, compute and return
    their truncated integer quotient; still does nothing special for a
    `0` second argument, the same acknowledged gap from Lesson 0.2.
  - *Depends on:* two plain `Int` arguments.
  - *Connects to:* called from this lesson's `when` expression.
  - *Shape:* the calculator's own domain logic, unchanged in role.

- **`main`**
  - *What it is:* the specially-recognized JVM entry point, proven real
    with `javap` in Lesson 0.1.
  - *Implementation:* unchanged in declaration; its body gains a
    nullable value and the logic to handle it safely.
  - *Its use:* still the only reason the JVM knows where to start; now
    also the place a genuinely-possibly-absent value is handled.
  - *Type:* a free (top-level) function.
  - *Responsibility:* be the program's single entry point.
  - *Depends on:* nothing to be declared; to run, depends on the file
    being compiled to a `.class` the JVM can load.
  - *Connects to:* called by the JVM's launcher; calls `println` and,
    through `when`, exactly one arithmetic function.
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
    This lesson's calls resolve to exactly this overload — note its
    parameter is already `message: Any?`, itself a **nullable type**
    (any real object, or `null`) — meaning `println` has always been
    able to accept `null` safely, proven directly by this lesson's own
    real output.
  - *Its use:* still this lesson's only way to make anything visible,
    including printing a nullable value directly.
  - *Type:* a top-level `inline` function.
  - *Responsibility:* convert its one argument to text and write it,
    followed by a line separator, to standard output — for a `null`
    argument specifically, writing the four characters `null`.
  - *Depends on:* exactly one argument, of any type including a
    nullable one.
  - *Connects to:* called from `main`; internally calls
    `System.out.println`.
  - *Shape:* a public standard-library API surface, unchanged in role.

- **`Int.toString`**
  - *What it is:* the real method converting an `Int` into its decimal
    text representation — the same conversion `println` itself performs
    internally, called here directly by this lesson's own code instead.
  - *Implementation:* declared on `Int` as `fun toString(): String` (an
    override of the same `toString` every Kotlin object has, inherited
    from `Any`, the common ancestor of every type).
  - *Its use:* this lesson's Concept Unit 2 calls it through a safe call
    (`?.`) on a nullable `Int?`, to prove a safe call's own behavior
    concretely rather than only in the abstract.
  - *Type:* an instance method on `Int` (and, more generally, on `Any`).
  - *Responsibility:* produce a `String` containing the decimal digits
    of the `Int` it's called on.
  - *Depends on:* the `Int` value it's called on; nothing else.
  - *Connects to:* called, through `?.`, on `pendingOperand` in Concept
    Unit 2, below.
  - *Shape:* a public standard-library API surface, present on every
    Kotlin value.

- **`NullPointerException`**
  - *What it is:* the real Java exception thrown when code tries to use
    a value that turns out to be `null` in a way that requires it not
    to be — the exact failure `!!` risks causing.
  - *Implementation:* `java.lang.NullPointerException`, a standard Java
    exception class; the JVM itself throws an instance of it the moment
    `!!` is evaluated against an actual `null`.
  - *Its use:* this lesson's own Concept Unit 4 deliberately triggers a
    real one, to prove `!!`'s danger concretely rather than only
    asserting it.
  - *Type:* a Java exception class (`java.lang.NullPointerException`,
    extending `java.lang.RuntimeException`).
  - *Responsibility:* signal, by immediately halting normal execution,
    that code attempted to treat a `null` value as if it were
    guaranteed real.
  - *Depends on:* nothing this lesson's code constructs directly — it's
    thrown automatically by `!!`'s own real implementation when its
    operand is `null`.
  - *Connects to:* thrown by the JVM itself in response to `!!`
    (Concept Unit 4, below); this lesson's code never catches or
    handles it — letting it crash the program is exactly the point
    being demonstrated.
  - *Shape:* a real Java standard-library type, surfacing here only as
    a consequence this lesson deliberately triggers to prove a point,
    not as something this lesson's own code constructs or extends.

---

## Concept Unit: Nullable Types and `?`

### The Problem

Every `Int` this curriculum has declared so far — `operandA`,
`operandB`, every function parameter — has been guaranteed to hold a
real whole number the instant it's declared. But Stage 1's real
calculator UI, still ahead of this curriculum, will have moments where
a number genuinely isn't available yet — before the user has typed
anything into a field, there is no number to read, only its absence.
Given that `Int` itself has no representation for "no number at all" (a
whole number is always some specific number), what do you think Kotlin
would need to do to a type to make room for a value that might
genuinely not be there? Would you expect `Int` itself to somehow start
allowing an absent state, or would you expect a *different*, related
type to exist for that purpose?

### Project Change

- **Reference Source** — no reference counterpart; from-scratch, laying
  groundwork for the BRD's "Handle missing calculator input" practice
  item.
- **Files affected** — modified: `Calculator.kt`.
- **Change type** — add (two new lines inside `main`).
- **Location** — inside `main`, immediately after the existing
  `val operatorSymbol = "+"` line from Lesson 0.3.
- **Dependencies** — none beyond Lessons 0.1–0.3.

### The New Code

```kotlin
val pendingOperand: Int? = null
println(pendingOperand)
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
11:     val pendingOperand: Int? = null  // ← new
12:     println(pendingOperand)           // ← new
13:     val result = when (operatorSymbol) {
14:         "+" -> add(operandA, operandB)
15:         "-" -> subtract(operandA, operandB)
16:         "*" -> multiply(operandA, operandB)
17:         "/" -> divide(operandA, operandB)
18:         else -> 0
19:     }
20:     println(result)
21: }
```

`main` now declares a value that genuinely might not hold a number —
not yet wired into the actual calculation, just introduced and printed
on its own for now.

### Introduce the Concept in Isolation

Two disposable scratch files, proving `Int?` is a genuinely different
type from `Int`, not merely a documentation note.

First, `verification/0.5/break1a_null_to_nonnull.kt`, trying to put
`null` directly into a plain `Int`:

```kotlin
fun main() {
    val count: Int = null
    println(count)
}
```

Compiled this session (deliberately, to observe the failure):

```
$ kotlinc break1a_null_to_nonnull.kt -include-runtime -d break1a_null_to_nonnull.jar
```

Real compiler output — this file was never run:

```
break1a_null_to_nonnull.kt:2:22: error: null cannot be a value of a non-null type 'Int'.
    val count: Int = null
                     ^^^^
```

Second, `verification/0.5/break1b_nullable_to_function.kt`, trying to
pass a nullable `Int?` to a function that requires a plain `Int`:

```kotlin
fun square(n: Int) = n * n

fun main() {
    val count: Int? = null
    println(square(count))
}
```

Real compiler output — this file was never run either:

```
break1b_nullable_to_function.kt:5:20: error: argument type mismatch: actual type is 'Int?', but 'Int' was expected.
    println(square(count))
                   ^^^^^
```

Both errors prove the same fact from two directions: `Int` and `Int?`
are two distinct, real types, and the compiler checks the difference
exactly as strictly as it checks `Int` against `Boolean` in Lesson
0.1's own `1 + true` error. Plain `Int` guarantees a real number is
always there — Kotlin refuses to let `null` masquerade as one. `Int?`
carries no such guarantee, and a function declared to require plain
`Int` refuses to accept it, for the identical reason.

Finally, `verification/0.5/lab1_nullable.kt`, showing what actually
*does* work — declaring and printing a genuinely nullable value:

```kotlin
fun main() {
    val count: Int? = null
    println(count)
}
```

Compiled and run this session:

```
$ kotlinc lab1_nullable.kt -include-runtime -d lab1_nullable.jar
$ java -jar lab1_nullable.jar
```

Real output:

```
null
```

`count`, declared `Int?`, holds real `null` — and printing it works
without crashing, producing the literal text `null`. This is called a
**nullable type**: `Int?` (an `Int`, with a trailing `?`) is Kotlin's
way of saying "a real `Int`, or nothing at all," and the two errors
above prove the compiler genuinely enforces the difference between it
and plain `Int`.

### Discard the Throwaway Examples

`break1a_null_to_nonnull.kt`, `break1b_nullable_to_function.kt`, and
`lab1_nullable.kt` are scratch, recorded in the verification folder,
not part of the calculator project. What they proved — that `Int` and
`Int?` are genuinely distinct, compiler-checked types — is what
`pendingOperand`'s own declaration, above, relies on and demonstrates.

### Mechanical Walkthrough

Every distinct syntactic element in the New Code:

- **`val pendingOperand: Int? = null`** — the same `val` keyword and
  `=` initializer already given full treatment, this time with an
  explicit type annotation (also already given full treatment) of
  `Int?` rather than plain `Int` — the nullable type given full
  treatment in this lesson's Header — initialized to the literal `null`,
  also given full treatment in this lesson's Header: a real value
  meaning "nothing here," distinct from `0` or any other real `Int`.
- **`println(pendingOperand)`** — the same overloaded, `inline`,
  `System.out.println`-delegating function given full treatment in this
  lesson's Header. `pendingOperand` is `Int?`, which is *not* one of
  `println`'s specifically-typed overloads (`Int`, `Boolean`, `Double`,
  and the others quoted in Lesson 0.1 — none of them accept a nullable
  type), so this call resolves to the general `println(message: Any?)`
  overload — itself already nullable-typed, as this lesson's Header
  notes, which is exactly why passing a genuinely `null` value here
  works without any special handling.

### CS Lens

Representing "no value" as a real, distinct, checkable state — rather
than reusing an ordinary value like `0` or an empty string to mean the
same thing by convention — is a recurring idea across computing, not
unique to Kotlin. Also recognized in: SQL's `NULL`, a column value
distinct from `0`, an empty string, or `false`; a spreadsheet's empty
cell, distinct from a cell containing the number `0`; a physical
in-tray that's genuinely empty, distinct from one containing a blank
sheet of paper; a vending machine's "out of stock" light, a state
genuinely different from "this item costs $0."

### SE Lens

Kotlin could have made every type implicitly nullable everywhere, the
way Java's own reference types are — any `String`, `Int` (boxed), or
custom class in Java can silently hold `null` unless a programmer
manually remembers to check. That alternative is exactly what Kotlin's
nullable-type system was designed to move away from: by making
non-null the default (plain `Int`, not `Int?`) and requiring the `?` to
opt *into* nullability explicitly, Kotlin turns "did I forget this
could be null" from a runtime crash waiting to happen into a compile
error caught before the program ever runs — proven directly by both
real errors above. The cost: every place a value genuinely can be
absent now has to say so explicitly, in the type itself, rather than
leaving it as an unstated assumption a reader has to guess at or
discover the hard way.

### Commands Needed

No new commands — the same `kotlinc ... -include-runtime -d ...` /
`java -jar ...` pair from Lesson 0.1.

### Run It

Real output, `Calculator.kt` at its current state (verified this
session as `step1_pending_operand.kt`):

```
$ kotlinc Calculator.kt -include-runtime -d Calculator.jar
$ java -jar Calculator.jar
```

Real output:

```
Calculator starting up
null
8
```

### Connect

`pendingOperand` now genuinely holds `null`, and the program handled
printing it without crashing. The next unit asks how to safely call a
method on a value that might be in exactly this state.

---

## Concept Unit: Safe Calls (`?.`)

### The Problem

`pendingOperand` was printed directly above, but a real program often
needs to *do* something with a value first — convert it, read a
property of it, transform it — before deciding what to show. If
`pendingOperand` held a real `Int`, calling `.toString()` on it would
work exactly like Lesson 0.1's own `println` calls resolving to a
specific overload. But `pendingOperand` might be `null` — and calling a
method directly on `null` is exactly the kind of operation Concept Unit
1 just proved the compiler refuses to allow without help. Given that,
what do you think should happen if code tries to call `.toString()` on
a value that turns out to actually be `null` at that moment — should it
crash, or is there a way to ask "call this, but only if there's really
something here to call it on"? If Kotlin required a full
`if (pendingOperand != null) { ... } else { ... }` check every single
time any nullable value needed to be used this way, what would that do
to code that touches several nullable values in a row?

### Project Change

- **Reference Source** — no reference counterpart; from-scratch, per
  the BRD's `Safe calls` concept for this lesson.
- **Files affected** — modified: `Calculator.kt`.
- **Change type** — replace (`println(pendingOperand)` becomes a safe
  call instead of a direct print).
- **Location** — the `println(pendingOperand)` line from Concept Unit
  1.
- **Dependencies** — none beyond Concept Unit 1.

### The New Code

```kotlin
println(pendingOperand?.toString())
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
11:     val pendingOperand: Int? = null
12:     println(pendingOperand?.toString())  // ← changed
13:     val result = when (operatorSymbol) {
14:         "+" -> add(operandA, operandB)
15:         "-" -> subtract(operandA, operandB)
16:         "*" -> multiply(operandA, operandB)
17:         "/" -> divide(operandA, operandB)
18:         else -> 0
19:     }
20:     println(result)
21: }
```

Only line 12 changed — `pendingOperand` is now safely converted to text
before being printed, instead of being handed to `println` directly.

### Introduce the Concept in Isolation

A disposable scratch file (`verification/0.5/lab2_safecall.kt`),
comparing a present value and a missing one side by side:

```kotlin
fun main() {
    val presentValue: Int? = 5
    val missingValue: Int? = null
    println(presentValue?.toString())
    println(missingValue?.toString())
}
```

Compiled and run this session:

```
$ kotlinc lab2_safecall.kt -include-runtime -d lab2_safecall.jar
$ java -jar lab2_safecall.jar
```

Real output:

```
5
null
```

`presentValue?.toString()` produced `"5"` — the real `Int.toString()`
call, given full treatment in this lesson's Header, actually ran,
because `presentValue` really did hold a value. `missingValue?.toString()`
produced `null` — not a crash, and not the text `"null"` from
`toString()` running and producing that string; the entire safe-called
expression evaluated directly to real `null`, without `toString()` ever
running at all, because `missingValue` held `null` at the moment the
safe call was reached. This is called a **safe call**: `?.` checks its
left side for `null` first, and only proceeds to the actual call when
there's a real value to call it on — skipping the call entirely,
rather than crashing, the moment there isn't.

### Discard the Throwaway Example

`lab2_safecall.kt` is scratch, recorded in the verification folder, not
part of the calculator project. What it proved — that `?.` skips its
call and evaluates to `null` when its target is `null`, without
crashing — is what `pendingOperand?.toString()`, above, relies on.

### Mechanical Walkthrough

Every distinct syntactic element in the New Code:

- **`pendingOperand?.toString()`** — `pendingOperand`, reading the
  nullable `Int?` value declared in Concept Unit 1; `?.`, the safe call
  given full treatment in this lesson's Header, checking whether
  `pendingOperand` is `null` before proceeding; `toString()`,
  `Int.toString`, given full treatment in this lesson's Header — called
  only if `pendingOperand` actually holds a real `Int`. Because
  `pendingOperand` is `null` here, per Concept Unit 1's own declaration,
  `toString()` never actually runs, and the whole expression evaluates
  to `null`.
- **`println(...)`** — the same overloaded, `inline`,
  `System.out.println`-delegating function given full treatment in this
  lesson's Header, reappearing here. The safe call's result is itself
  nullable (a safe call on an `Int?` produces a `String?`, not a plain
  `String`, since the call might not have run at all), resolving this
  call to the general `println(message: Any?)` overload, exactly as
  Concept Unit 1's direct `println(pendingOperand)` did.

### CS Lens

Attempting an operation only when its target genuinely exists, and
producing a clean "nothing happened" result otherwise instead of
failing outright, is a pattern that recurs beyond Kotlin's own syntax.
Also recognized in: a spreadsheet formula like `=IF(A1<>"", A1*2, "")`,
performing a calculation only when a cell isn't empty; JavaScript's own
`?.` optional chaining, solving the identical problem with nearly
identical syntax; a phone call that simply doesn't connect, rather than
connecting to nothing and causing damage, when the number dialed isn't
in service; a factory robot arm that skips its assembly step entirely
when a sensor reports no part is actually present on the line.

### SE Lens

The alternative to `?.` is writing the same check by hand every time:
`if (pendingOperand != null) { println(pendingOperand.toString()) }
else { println(null) }` — functionally identical, but longer, and
repeated at every single place a nullable value needs to be used
safely. `?.` is not a new capability Kotlin invented from nothing; it's
a deliberately shorter, harder-to-forget way to write a check that was
always possible to write by hand. The real cost of the shorthand: a
safe call silently produces `null` when its target is absent, which is
exactly correct behavior, but a reader skimming code has to remember
that `?.` can be a place a `null` enters the rest of an expression, not
just a place one gets consumed and disposed of — a habit this
curriculum will keep reinforcing every time `?.` reappears.

### Commands Needed

No new commands.

### Run It

Real output, `Calculator.kt` at its current state (verified this
session as `step2_safecall.kt`):

```
$ kotlinc Calculator.kt -include-runtime -d Calculator.jar
$ java -jar Calculator.jar
```

Real output:

```
Calculator starting up
null
8
```

Identical to Concept Unit 1's output — the safe call changed *how*
`pendingOperand` gets converted to text, not what actually gets
printed, since it was `null` either way.

### Connect

`pendingOperand` can now be safely operated on without crashing, even
while `null`. The next unit asks what happens when a real calculation —
not just a print statement — needs a guaranteed, non-null number to
work with.

---

## Concept Unit: The Elvis Operator (`?:`)

### The Problem

`operandB`, unlike `pendingOperand`, actually needs to feed into a real
calculation — `add(operandA, operandB)` and its three siblings all
require a plain `Int`, not an `Int?`, per Concept Unit 1's own real
compiler proof. If `operandB` became genuinely nullable — representing
a real calculator where the second number hasn't been entered yet —
the existing `when` expression would stop compiling entirely, for the
identical reason `break1b_nullable_to_function.kt` failed in Concept
Unit 1. A safe call alone doesn't solve this: `?.` skips a call
gracefully, but `add` still needs an actual `Int` to run at all, not a
version of itself that gracefully does nothing. Given that, what would
a calculator reasonably do with a genuinely missing second operand —
refuse to compute anything at all, or substitute some sensible default
number and continue? If it should substitute a default, what number
would make the most sense for addition specifically, and would you
expect that same number to make sense for every one of the other three
operations too?

### Project Change

- **Reference Source** — no reference counterpart; from-scratch,
  completing the BRD's "Handle missing calculator input" practice item.
- **Files affected** — modified: `Calculator.kt`.
- **Change type** — replace (`operandB`'s declaration becomes nullable)
  and add (one new fallback value, and the `when` expression's calls
  are updated to use it).
- **Location** — the `val operandB = 2` line, and every call inside the
  `when` expression, both from Lesson 0.3.
- **Dependencies** — none beyond Concept Units 1–2.

### The New Code

```kotlin
val operandB: Int? = null
val safeOperandB = operandB ?: 0
```

and, inside the `when` expression:

```kotlin
"+" -> add(operandA, safeOperandB)
```

(with `subtract`, `multiply`, and `divide`'s own branches updated the
same way, each replacing `operandB` with `safeOperandB`).

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
9:      val operandB: Int? = null              // ← changed: was `= 2`
10:     val operatorSymbol = "+"
11:     val safeOperandB = operandB ?: 0         // ← new
12:     val result = when (operatorSymbol) {
13:         "+" -> add(operandA, safeOperandB)    // ← changed: was operandB
14:         "-" -> subtract(operandA, safeOperandB) // ← changed
15:         "*" -> multiply(operandA, safeOperandB) // ← changed
16:         "/" -> divide(operandA, safeOperandB)   // ← changed
17:         else -> 0
18:     }
19:     println(result)
20: }
```

`pendingOperand` and its safe-call demonstration from Concept Units
1–2 are removed here — their teaching job is done, and `operandB`
itself now demonstrates the same nullable-value idea for real, inside
the calculator's actual working logic instead of a side demonstration.
`operandB` is now honestly nullable, and `safeOperandB` guarantees a
real `Int` the arithmetic functions can actually accept.

### Introduce the Concept in Isolation

A disposable scratch file (`verification/0.5/break3_nullable_operand.kt`),
proving the exact failure this unit's Problem described actually
happens:

```kotlin
fun add(a: Int, b: Int) = a + b

fun main() {
    val operandA = 6
    val operandB: Int? = null
    println(add(operandA, operandB))
}
```

Compiled this session (deliberately, to observe the failure):

```
$ kotlinc break3_nullable_operand.kt -include-runtime -d break3_nullable_operand.jar
```

Real compiler output — this file was never run:

```
break3_nullable_operand.kt:6:27: error: argument type mismatch: actual type is 'Int?', but 'Int' was expected.
    println(add(operandA, operandB))
                          ^^^^^^^^
```

Confirmed: making `operandB` nullable genuinely breaks the direct call
to `add`, exactly as predicted. A second scratch file,
`verification/0.5/lab3_elvis.kt`, fixes the identical problem with the
Elvis operator:

```kotlin
fun add(a: Int, b: Int) = a + b

fun main() {
    val operandA = 6
    val operandB: Int? = null
    val safeOperandB = operandB ?: 0
    println(add(operandA, safeOperandB))
}
```

Compiled and run this session:

```
$ kotlinc lab3_elvis.kt -include-runtime -d lab3_elvis.jar
$ java -jar lab3_elvis.jar
```

Real output:

```
6
```

`safeOperandB` is a plain `Int`, not `Int?` — the compiler accepted
`add(operandA, safeOperandB)` without complaint, and the real output,
`6`, is `add(6, 0)`: `operandB ?: 0` evaluated to `0` because
`operandB` was `null`. This is called the **Elvis operator**: `x ?: y`
evaluates to `x` if `x` is not `null`, and to `y` — the fallback —
if it is, converting a nullable value into a guaranteed real one with
one explicit, visible choice of default.

### Discard the Throwaway Examples

Both `break3_nullable_operand.kt` and `lab3_elvis.kt` are scratch,
recorded in the verification folder, not part of the calculator
project. What they proved — that a nullable operand really does break
`add`'s direct call, and that `?:` really does fix it by supplying a
real fallback `Int` — is exactly what `Calculator.kt`'s own updated
`operandB`/`safeOperandB`, above, relies on.

### Mechanical Walkthrough

Every distinct syntactic element in the New Code:

- **`val operandB: Int? = null`** — the same `val` and `=` already given
  full treatment, now declaring `operandB` itself — not a separate
  demonstration value — as `Int?`, the nullable type given full
  treatment in this lesson's Header, initialized to `null`.
- **`val safeOperandB = operandB ?: 0`** — `val` and `=` again,
  initializing a new name to the result of an Elvis expression:
  `operandB`, reading the nullable value just declared; `?:`, the Elvis
  operator given full treatment in this lesson's Header; `0`, an `Int`
  literal (full treatment given in Lesson 0.1) serving as the fallback.
  Because `operandB` is `null`, this expression evaluates to `0`, and —
  critically — `safeOperandB`'s own type is inferred as plain `Int`,
  not `Int?`: an Elvis expression's result is only ever nullable if
  *both* sides could be `null`, and `0` cannot be.
- **`add(operandA, safeOperandB)`** — the same kind of function call
  given full treatment in Lesson 0.2, now passing `safeOperandB` — a
  plain `Int` — instead of the nullable `operandB` directly, which is
  exactly what makes this call compile where `break3`'s version above
  did not.
- **`subtract(operandA, safeOperandB)`**,
  **`multiply(operandA, safeOperandB)`**,
  **`divide(operandA, safeOperandB)`** — the same substitution applied
  to the other three branches of the `when` expression given full
  treatment in Lesson 0.3, each now passing `safeOperandB` in place of
  `operandB`, for the identical reason.

### CS Lens

Converting a value that might be absent into a guaranteed real one, by
supplying an explicit, visible default at the exact point the
uncertainty would otherwise propagate further, recurs well beyond this
one operator. Also recognized in: SQL's `COALESCE` function, returning
the first non-`NULL` value from a list of candidates; a configuration
system falling back to a hard-coded default when a setting file omits a
value; a thermostat using a stored "last known temperature" the moment
its sensor briefly stops reporting; a form's placeholder text, showing
a sensible default the instant a user hasn't typed anything of their
own yet.

### SE Lens

Choosing `0` as `operandB`'s fallback here is a real design decision,
not a neutral default — it's the correct choice specifically because
`0` is `add`'s and `subtract`'s own mathematical identity (adding or
subtracting `0` changes nothing), but it would be actively wrong for
`multiply` and `divide`, where the honest fallback would be `1`, not
`0` (multiplying by `0` always produces `0`, silently discarding
`operandA` entirely; dividing by `0` is worse still — `divide`'s own
unhandled `0`-divisor gap, acknowledged back in Lesson 0.2, applies
here too). This lesson deliberately uses one fallback for all four
operations anyway, and states plainly why that's imperfect: choosing
the mathematically correct fallback per operation would mean moving the
`?:` fallback logic *inside* each `when` branch instead of computing
`safeOperandB` once up front — a real, reasonable improvement this
lesson leaves as an acknowledged gap rather than a hidden one, for a
later lesson to actually make.

### Commands Needed

No new commands.

### Run It

Real output, `Calculator.kt` at its current state (verified this
session as `step3_elvis_calculator.kt`):

```
$ kotlinc Calculator.kt -include-runtime -d Calculator.jar
$ java -jar Calculator.jar
```

Real output:

```
Calculator starting up
6
```

`6` is `add(6, 0)` — the calculator kept working correctly even with a
genuinely missing second operand, instead of crashing or refusing to
compile.

### Connect

`Calculator.kt` now safely handles a missing operand, end to end. The
last unit in this lesson shows the unsafe alternative this lesson
deliberately avoided, and proves, concretely, why.

---

## Concept Unit: `!!` and Null as a Design Problem

### The Problem

`operandB ?: 0` is not the only way Kotlin lets code turn an `Int?`
into something usable in a call requiring plain `Int` — `!!` offers a
different, much blunter tool: "trust me, use this value directly, I'm
certain it isn't actually `null` right now." Given Concept Unit 3's own
real proof that `add` flatly refuses an `Int?` argument, and given that
`!!` exists specifically to force that refusal to go away, what do you
think happens if a programmer's certainty turns out to be wrong — if
`!!` is used on a value that actually *is* `null` at that exact moment?
Would you expect Kotlin to quietly substitute some default, the way
`?:` does, or something else entirely?

### Project Change

- **Reference Source** — no reference counterpart; from-scratch, per
  the BRD's `!!` and "Null as a design problem" concepts for this
  lesson.
- **Files affected** — none; this unit is isolated-lab only and
  deliberately never touches `Calculator.kt`, for reasons this unit's
  own SE Lens, below, states directly.
- **Change type** — n/a.
- **Location** — n/a.
- **Dependencies** — none beyond Concept Units 1–3.

### The New Code

n/a for this unit — see the isolated labs below; per this unit's own
Project Change, no code lands in `Calculator.kt`.

### The Updated Project

n/a — `Calculator.kt` is unchanged by this unit; its state remains
exactly `step3_elvis_calculator.kt`, already shown as this lesson's Run
It in Concept Unit 3, above.

### Introduce the Concept in Isolation

First, `verification/0.5/lab4a_notnull_assert_ok.kt`, using `!!` when
the certainty behind it is actually correct:

```kotlin
fun add(a: Int, b: Int) = a + b

fun main() {
    val operandB: Int? = 4
    println(add(2, operandB!!))
}
```

Compiled and run this session:

```
$ kotlinc lab4a_notnull_assert_ok.kt -include-runtime -d lab4a_notnull_assert_ok.jar
$ java -jar lab4a_notnull_assert_ok.jar
```

Real output:

```
6
```

`operandB!!` worked exactly like plain `operandB` would have — `2 + 4
= 6`, no different from calling `add` with two ordinary `Int`s. When
the value genuinely isn't `null`, `!!` is invisible at runtime; it only
changes what the *compiler* accepts, not what the program *does*.

Second, `verification/0.5/break4b_notnull_assert_crash.kt`, using the
identical `!!` when the value actually *is* `null`:

```kotlin
fun add(a: Int, b: Int) = a + b

fun main() {
    val operandB: Int? = null
    println(add(2, operandB!!))
}
```

Compiled this session — unlike every other `break` file in this
lesson, this one compiles successfully:

```
$ kotlinc break4b_notnull_assert_crash.kt -include-runtime -d break4b_notnull_assert_crash.jar
```

No compiler output — it built without complaint. Run this session:

```
$ java -jar break4b_notnull_assert_crash.jar
```

Real output — a genuine crash, not a printed result:

```
Exception in thread "main" java.lang.NullPointerException
	at Break4b_notnull_assert_crashKt.main(break4b_notnull_assert_crash.kt:5)
	at Break4b_notnull_assert_crashKt.main(break4b_notnull_assert_crash.kt)
```

The program never reached `println` at all — it terminated with a real
`NullPointerException`, given full treatment in this lesson's Header,
thrown by the JVM the instant `operandB!!` evaluated against an actual
`null`. This is the concrete proof behind `!!`'s name: it *asserts*
non-`null`-ness rather than *guaranteeing* it — the compiler stops
checking the moment `!!` is written, and if the programmer's certainty
turns out to be wrong, the failure that Concept Unit 1's `Int` vs.
`Int?` distinction was specifically designed to prevent happens anyway,
just later, and worse: as a crash while the program is actually
running, rather than a rejection before it ever started.

### Discard the Throwaway Examples

Both `lab4a_notnull_assert_ok.kt` and `break4b_notnull_assert_crash.kt`
are scratch, recorded in the verification folder, not part of the
calculator project — and, per this unit's own Project Change, nothing
from either one lands in `Calculator.kt` at all. What they proved —
that `!!` is invisible when correct and a real, crashing exception when
wrong — is the entire reason this lesson's actual calculator code uses
`?:` instead, in Concept Unit 3, above.

### Mechanical Walkthrough

Every distinct syntactic element in the two lab files above:

- **`operandB!!`** — `operandB`, the nullable `Int?` value from each
  lab's own declaration; `!!`, the non-null assertion given full
  treatment in this lesson's Header, telling the compiler to treat the
  expression as plain `Int` from this point on, without checking. In
  the first lab, `operandB` genuinely holds `4`, so `!!` succeeds
  silently, and `operandB!!` behaves exactly like reading `operandB`
  directly would if it had been declared as plain `Int` all along. In
  the second lab, `operandB` genuinely holds `null`, so `!!` throws — a
  real `NullPointerException`, given full treatment in this lesson's
  Header — immediately, before `add` is ever actually called.
- **`add(2, operandB!!)`** — the same kind of function call given full
  treatment in Lesson 0.2; in the first lab, this call runs normally
  once `!!` succeeds, producing `6`; in the second lab, this call never
  runs at all — the exception happens while evaluating the argument,
  before `add` itself is ever entered.

### CS Lens

Trading a checked guarantee for an unchecked, programmer-asserted
promise — accepted by the tooling, but backed by nothing but the
programmer's own confidence — recurs as a real, recognizable tradeoff
well beyond this one operator. Also recognized in: a type cast in Java
or C# (`(String) someObject`), asserting an object's real type without
the compiler verifying it, throwing a `ClassCastException` at runtime
if the assertion is wrong; C's `unsafe` blocks and raw pointer
dereferences, trusting a programmer's claim about memory that the
compiler cannot check; an `assert` statement in many languages,
documenting an assumption that's checked only if assertions happen to
be enabled; a database foreign key *without* a `NOT NULL` constraint
that the application code nonetheless assumes is always populated.

### SE Lens

`!!` was not used anywhere in this lesson's own real `Calculator.kt` —
`?:`, in Concept Unit 3, was chosen instead, and this is the direct,
deliberate reason why: `?:` has to state its fallback value explicitly,
right there in the code, which means there is no way to reach for it
without also deciding what should happen when the value really is
absent. `!!` requires no such decision — which is exactly what makes it
dangerous: it lets a programmer skip thinking about the absent case
entirely, right up until the moment a real user's real missing input
turns that skipped thought into a real crash, in production, for a real
person. This is what "null as a design problem" means concretely: the
question is never *whether* to handle a value that might be absent —
Kotlin's type system, proven throughout this lesson, makes that
unavoidable the moment a type is written as `T?` — the real design
question is *where* that handling happens: explicitly, with a chosen
fallback, at the point the uncertainty is introduced (`?:`, this
lesson's own real choice), or silently deferred, as an unstated promise
that might break later (`!!`, demonstrated here only to be rejected).
`!!` remains a real, legitimate tool for the rare case a `null` at a
given point would itself indicate a genuine, unrecoverable bug elsewhere
in the program — but reaching for it as a convenience, to avoid
deciding on a real fallback, is precisely the misuse this unit's own
crash was built to make concrete rather than abstract.

### Commands Needed

The same `kotlinc ... -include-runtime -d ...` / `java -jar ...` pair
already used throughout this lesson — no new commands, though this
unit's second lab is the first file in this lesson to compile cleanly
and then crash at runtime, rather than either running cleanly or
failing to compile.

### Run It

This unit adds nothing to `Calculator.kt` — per its own Project
Change, there is no new project-level Run It here. `Calculator.kt`'s
real, current output remains exactly what Concept Unit 3 already
verified.

### Connect

`!!`'s real danger is now proven, not just described — a genuine crash,
triggered on purpose, contrasted directly against `Calculator.kt`'s own
working, crash-free handling of the identical missing-value situation.
This is the last new concept this lesson introduces.

---

## Connect the Pieces

Follow `operandB` through every unit this lesson built, using
`Calculator.kt`'s real final state:

1. `main` starts and prints `Calculator starting up` (unchanged since
   Lesson 0.1).
2. `operandA` is set to `6` (unchanged since Lesson 0.3).
3. `operandB` is declared `Int? = null` (Concept Unit 3) — a real,
   compiler-tracked possibility of absence, proven distinct from plain
   `Int` by two real compiler errors in Concept Unit 1.
4. `operatorSymbol` is set to `"+"` (unchanged since Lesson 0.3).
5. `safeOperandB = operandB ?: 0` runs (Concept Unit 3): because
   `operandB` is `null`, the Elvis operator's fallback, `0`, is what
   `safeOperandB` actually holds — a plain, guaranteed `Int`.
6. `when (operatorSymbol)` matches `"+"` (the same real `when`
   expression Lesson 0.3 built) and calls `add(operandA, safeOperandB)`
   — `add(6, 0)`, calling the real `Int.plus` this curriculum proved in
   Lesson 0.1, returning `6`.
7. `println(result)` prints `6`.

Concept Units 1 and 2's own `pendingOperand` demonstration, and Concept
Unit 4's `!!` crash, both happened in isolation — proven real, then
discarded, exactly as the Concept Isolation Rule this curriculum
follows requires — leaving `Calculator.kt` itself holding only the
safe, working version: a genuinely nullable operand, handled explicitly,
with no crash and no unchecked assertion anywhere in the real project.
Two lines of real, verified terminal output — `Calculator starting up`
and `6` — are the complete, observable result of a calculator that now
survives a missing input instead of merely assuming one will never
happen. Lesson 0.6 picks this file back up to give the calculator its
first real class.
