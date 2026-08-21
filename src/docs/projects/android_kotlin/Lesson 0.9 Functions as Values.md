# Lesson 0.9: Functions as Values

**What you will build.** A small, throwaway collection-processing
practice file — not part of `Calculator.kt` — demonstrating that a
function can be stored, passed around, and written inline exactly the
way an `Int` or a `String` already can. Then, back in `Calculator.kt`,
`Operation` gains the `fun` modifier, letting a one-line lambda satisfy
it directly, without a whole named class the way `Addition` and its
three siblings still require. The transferable problem underneath the
feature: what it means for a function itself — not its result, the
function — to be a value a program can hold in a variable, pass as an
argument, and write anonymously on the spot, instead of only ever being
something you *call* by a fixed name written once, in one place.

**What you need to know first.** `Calculator.kt` as Lesson 0.8 left it:
the `fun interface`-eligible `Operation` interface (not yet marked
`fun`), `Addition`/`Subtraction`/`Multiplication`/`Division`
implementing it, the `Operator` enum carrying one each, and
`Calculation`, a `data class` recording a completed calculation. Also
`fun`, parameters, and return values, from Lesson 0.2, and `interface`/
`override`, from Lesson 0.7.

**Terms used in this lesson**

- **program** — a finite sequence of instructions a computer executes
  in order. This lesson changes what a function *is*, to a program —
  a value, not just a name — not the fact that instructions still run
  in sequence.
- **value** — a piece of data a program holds and operates on. This
  lesson's entire subject is proving that a function is one, in exactly
  Lesson 0.1's sense: held, passed around, stored under a name.
- **type** — a category determining what a value's data is and what
  operations are valid on it. This lesson introduces a new *source* of
  types: a type describing a function's own shape — its parameters and
  return value — rather than a piece of ordinary data.
- **`fun`** — the keyword beginning a function declaration, given full
  treatment in Lesson 0.2. Every function this lesson treats as a value
  still starts with it; nothing about declaring a function changes,
  only what can be *done* with the declared function afterward.
- **parameter** — a name standing in for a value a function receives
  each call, given full treatment in Lesson 0.2. This lesson's lambdas
  declare parameters the identical way, just without `fun` or a
  separate name for the function itself.
- **`interface`** — a contract describing what methods a class must
  provide, given full treatment in Lesson 0.7. `Operation`, still
  exactly that contract, gains a new capability this lesson without any
  change to what it actually requires.
- **`override`** — a keyword required on a method providing the real
  body for a method an interface only declared, given full treatment
  in Lesson 0.7. `Addition` and its three siblings still use it,
  unchanged, this lesson.
- **function type** — a type describing a function's own shape: how
  many parameters it takes, each one's type, and its return type —
  written as `(ParamType, ParamType) -> ReturnType`. It exists so a
  variable, a parameter, or a property can state, in its own type, "I
  hold something callable with this exact shape," the same way `: Int`
  states a value is a whole number — checked by the compiler with the
  identical strictness proven for every other type this curriculum has
  used since Lesson 0.1.
- **function reference (`::`)** — two colons before a function's name,
  producing a value of that function's own function type, usable
  anywhere that type is expected, without calling the function itself.
  It exists so an *already-declared*, named function can be handed
  around as a value directly, without writing a second, wrapping
  function whose only job would be calling the first one.
- **lambda expression** — a function written anonymously, inline,
  directly where it's needed, with no `fun` keyword and no name of its
  own: `{ parameters -> body }`. It exists for the common case where a
  function is needed as a value exactly once, at one specific call
  site, and giving it a permanent top-level name and a separate
  declaration elsewhere would be pure ceremony for something used in
  exactly one place.
- **higher-order function** — a function that accepts another function
  as one of its own parameters, or returns one, rather than only
  accepting and returning ordinary data. It exists so a piece of
  behavior — not just a piece of data — can be *supplied* to a
  function, letting that function's own logic be customized per call
  without rewriting the function itself for every variation.
- **functional interface (`fun interface`)** — an interface declared
  with the `fun` modifier, stating it has exactly one method to
  implement — its **single abstract method** — which lets a lambda
  satisfy the entire interface directly, with no named implementing
  class required at all. It exists so an interface whose entire
  contract really is "one function's worth of behavior" can be
  satisfied as cheaply as a lambda, instead of always requiring the
  ceremony of a full class declaration the way Lesson 0.7's `Addition`
  still does.
- **SAM conversion** — the compiler-performed conversion of a lambda
  expression into a real object implementing a functional interface's
  one required method. It exists as the actual mechanism behind a
  functional interface's convenience: `Operation { a, b -> a + b }`
  isn't special syntax for `Operation` specifically — it's the general
  rule that any `fun interface` with one method can be built this way,
  proven with a completely unrelated interface in this lesson's own
  Concept Unit 4.

**Objects and methods used**

- **`List.map`**
  - *What it is:* a Kotlin standard-library function that builds a new
    `List`, transforming every element of an existing one.
  - *Implementation:* real source, fetched this session from
    `kotlin-stdlib-sources.jar`
    (`commonMain/generated/_Collections.kt`):
    ```kotlin
    /**
     * Returns a list containing the results of applying the given [transform] function
     * to each element in the original collection.
     */
    public inline fun <T, R> Iterable<T>.map(transform: (T) -> R): List<R> {
        return mapTo(ArrayList<R>(collectionSizeOrDefault(10)), transform)
    }
    ```
    `transform`'s own declared type, `(T) -> R`, is a **function type**
    given full treatment in this lesson's Header: `map` doesn't just
    accept ordinary data, it requires a real function as its one
    argument.
  - *Its use:* this lesson's Concept Unit 3 uses it to double every
    number in a list, passing a lambda as `transform`.
  - *Type:* a generic extension function on `Iterable<T>` (an
    `inline` function, the same performance-oriented category given
    full treatment in Lesson 0.1 for `println`).
  - *Responsibility:* produce a new `List`, the same length as the
    original, where each element is the result of calling `transform`
    on the matching original element — the original list itself is
    never modified.
  - *Depends on:* the list it's called on, and one function argument
    matching `transform`'s declared shape.
  - *Connects to:* called directly on a `List` in this lesson's own
    code; internally calls `mapTo`, not otherwise used by name in this
    lesson.
  - *Shape:* a public standard-library API surface — this lesson's
    first concrete example of a **higher-order function**, given full
    treatment above.

- **`List.filter`**
  - *What it is:* a Kotlin standard-library function that builds a new
    `List` containing only the elements of an existing one that satisfy
    a given condition.
  - *Implementation:* real source, fetched this session from
    `kotlin-stdlib-sources.jar`
    (`commonMain/generated/_Collections.kt`):
    ```kotlin
    /**
     * Returns a list containing only elements matching the given [predicate].
     */
    public inline fun <T> Iterable<T>.filter(predicate: (T) -> Boolean): List<T> {
        return filterTo(ArrayList<T>(), predicate)
    }
    ```
    `predicate`'s own declared type, `(T) -> Boolean`, is a second real
    function type — this one always returning a `Boolean`, the same
    type given full treatment in Lesson 0.1, stating "keep this
    element, or not."
  - *Its use:* this lesson's Concept Unit 3 uses it to keep only the
    numbers greater than `3` in a list, passing a lambda as
    `predicate`.
  - *Type:* a generic extension function on `Iterable<T>`, `inline`.
  - *Responsibility:* produce a new `List`, no longer than the
    original, holding only the elements for which `predicate` returned
    `true` — in the same relative order they appeared in the original.
  - *Depends on:* the list it's called on, and one function argument
    matching `predicate`'s declared shape.
  - *Connects to:* called directly on a `List`; internally calls
    `filterTo`, not otherwise used by name in this lesson.
  - *Shape:* a public standard-library API surface, the second concrete
    higher-order function this lesson's own code calls.

- **`Int.compareTo`**
  - *What it is:* the real function `>` (and `<`, `>=`, `<=`) calls
    when comparing two numbers — an operator function, the same
    category given full treatment in Lesson 0.1 for `Int.plus`.
  - *Implementation:* real source, fetched this session from
    `kotlin-stdlib-sources.jar` (`commonMain/kotlin/Primitives.kt`,
    inside `Int`'s own declaration):
    ```kotlin
    /**
     * Compares this value with the specified value for order.
     * Returns zero if this value is equal to the specified other value, a negative number if it's less than other,
     * or a positive number if it's greater than other.
     */
    @kotlin.internal.IntrinsicConstEvaluation
    public override operator fun compareTo(other: Int): Int
    ```
    No body — a bodyless compiler intrinsic on the JVM, the identical
    shape Lesson 0.1 proved for `Int.plus`; `>` itself is syntax
    Kotlin translates into a call to this method, checking whether its
    real `Int` return value is positive.
  - *Its use:* this lesson's Concept Unit 3 uses `>` inside a `filter`
    lambda to keep only the larger numbers in a list.
  - *Type:* an `operator fun` (instance method) on `Int`, bodyless.
  - *Responsibility:* given another number, report whether the value
    it's called on is less than, equal to, or greater than that number,
    as a single signed `Int`.
  - *Depends on:* the value it's called on and one `Int` argument.
  - *Connects to:* invoked wherever this lesson's code writes `n > 3`.
  - *Shape:* a compiler-intrinsic seam, the same kind Lesson 0.1
    proved for `Int.plus`.

- **`Operation`**
  - *What it is:* the calculator's own operation contract, given full
    treatment in Lesson 0.7, gaining the `fun` modifier this lesson.
  - *Implementation:* `fun interface Operation { fun apply(current:
    Int, amount: Int): Int }` — the identical single method Lesson 0.7
    declared, now marked as a **functional interface**, given full
    treatment in this lesson's Header.
  - *Its use:* still implemented by `Addition`/`Subtraction`/
    `Multiplication`/`Division`, unchanged; this lesson's own isolated
    labs prove it can now also be satisfied directly by a lambda,
    without a named class, though `Calculator.kt`'s own real project
    code keeps the four named classes as-is.
  - *Type:* a `fun interface` declaration.
  - *Responsibility:* state, and nothing more, that any real
    implementation — a class, or now a lambda — must provide one
    method, `apply`, with this exact signature.
  - *Depends on:* nothing; still cannot be constructed directly, the
    same real error Lesson 0.7 proved for a bare `interface`.
  - *Connects to:* implemented by `Addition`, `Subtraction`,
    `Multiplication`, and `Division` (all given full treatment in
    Lesson 0.7, unchanged); used as `Calculator.perform`'s parameter
    type, unchanged from Lesson 0.7.
  - *Shape:* the same abstraction boundary Lesson 0.7 established,
    widened this lesson to accept one more kind of implementation.

- **`Calculator`**
  - *What it is:* the calculator's own class, given full treatment in
    Lessons 0.6–0.7.
  - *Implementation:* unchanged this lesson — `Calculator`'s own
    `perform` method is exactly as Lesson 0.8 left it.
  - *Its use:* `Calculator.kt`'s real project code, this lesson,
    changes only `Operation`'s own declaration; every call site
    involving `Calculator` is untouched.
  - *Type:* a class declaration, with a primary constructor.
  - *Responsibility:* unchanged — hold one running total and update it
    by delegating to whatever `Operation` it's given.
  - *Depends on:* unchanged from Lessons 0.6–0.8.
  - *Connects to:* unchanged from Lessons 0.6–0.8.
  - *Shape:* unchanged architectural role from Lessons 0.6–0.8.

- **`main`**
  - *What it is:* the specially-recognized JVM entry point, proven
    real with `javap` in Lesson 0.1.
  - *Implementation:* unchanged this lesson — `main`'s own declaration
    is exactly as Lesson 0.8 left it.
  - *Its use:* still the only reason the JVM knows where to start;
    untouched by this lesson's own single-word change to `Operation`.
  - *Type:* a free (top-level) function.
  - *Responsibility:* unchanged — be the program's single entry point.
  - *Depends on:* unchanged from Lessons 0.1–0.8.
  - *Connects to:* unchanged from Lessons 0.1–0.8.
  - *Shape:* unchanged architectural role from Lessons 0.1–0.8.

- **`println`**
  - *What it is:* the standard-library function writing text and a
    line break to standard output.
  - *Implementation:* real source, unchanged from Lesson 0.1
    (`jvmMain/kotlin/io/Console.kt`) — this lesson's own calls to it
    resolve identically to how Lesson 0.8 left them.
  - *Its use:* still this lesson's only way to make anything visible.
  - *Type:* a top-level `inline` function.
  - *Responsibility:* unchanged — convert its one argument to text and
    write it, followed by a line separator, to standard output.
  - *Depends on:* exactly one argument.
  - *Connects to:* called from `main`; internally calls
    `System.out.println`.
  - *Shape:* a public standard-library API surface, unchanged in role.

---

## Concept Unit: Function Types and Function References

### The Problem

Every function this curriculum has written so far — `add`, `apply`,
`perform` — has only ever been *called*, by its fixed, written name, at
a fixed call site decided while writing the code. Given that Lesson
0.1 already established that `Int` and `String` are types a variable
can hold, and that a variable's type states what kind of value it can
hold, what do you think it would take for a variable to hold a
*function* instead of an ordinary value — what would that variable's
own type even need to describe, given that a function isn't just one
piece of data the way an `Int` is? If an already-written function like
`add` could be stored this way, what do you think the syntax for
"give me `add` itself, not the result of calling it" might look like?

### Project Change

- **Reference Source** — no reference counterpart; from-scratch, per
  the BRD's "Functions as values" concept for this lesson.
- **Files affected** — created: `CollectionTools.kt`, a standalone
  practice file, explicitly **not** part of the calculator project —
  it will never be referenced by `Calculator.kt`, and this lesson's own
  Closing states plainly that it is discarded once this lesson ends.
- **Change type** — add (a brand-new file).
- **Location** — n/a; this is the file's first content.
- **Dependencies** — none beyond Lessons 0.1–0.2.

### The New Code

```kotlin
fun double(n: Int): Int {
    return n * 2
}

fun main() {
    val transform: (Int) -> Int = ::double
    println(transform(5))
}
```

### The Updated Project

This is a brand-new file — step 5's code above is the entire file, with
nothing surrounding it yet.

### Introduce the Concept in Isolation

The New Code above already is this unit's own isolated demonstration —
`double` exists purely to prove the mechanism, distinct from anything
`Calculator.kt` needs. Compiled and run this session
(`verification/0.9/lab1_function_type_reference.kt`, identical to the
code shown above):

```
$ kotlinc lab1_function_type_reference.kt -include-runtime -d lab1_function_type_reference.jar
$ java -jar lab1_function_type_reference.jar
```

Real output:

```
10
```

`transform`, a variable, holds `double` itself — not the result of
calling it — and `transform(5)` runs `double`'s own body with `5`,
producing `10`, exactly as calling `double(5)` directly would have.
This is called a **function type**: `(Int) -> Int`, `transform`'s own
declared type, states "a function taking one `Int` and returning an
`Int`" — the same kind of type-checking Lesson 0.1 proved for `Int`
and `Boolean`, here describing a function's shape instead of a plain
value's kind. `::double` is called a **function reference**: two
colons before `double`'s own name, producing a value of exactly that
function type, without calling `double` at all.

### Discard the Throwaway Example

This unit's own demonstration lives in `CollectionTools.kt` itself for
now, carried forward (not yet discarded) into the next three units,
which continue building on it; the identical code was also saved,
standalone, to the verification folder as this unit's own proof. Per
this lesson's own Closing, `CollectionTools.kt` in its entirety is
discarded once this whole lesson ends — it never becomes part of the
calculator project.

### Mechanical Walkthrough

Every distinct syntactic element in the New Code:

- **`fun double(n: Int): Int { return n * 2 }`** — an ordinary function
  declaration, every piece already given full treatment in Lesson 0.2:
  `fun`, the identifier `double`, one `Int` parameter, an explicit
  `Int` return type, `return`, and `n * 2` calling the real `Int.times`
  this curriculum proved in Lesson 0.2. Nothing about this declaration
  is new — the new part is what happens to `double` next.
- **`val transform: (Int) -> Int = ::double`** — the same `val` and
  explicit type annotation given full treatment in Lesson 0.1, this
  time annotated with a **function type**, given full treatment in
  this lesson's Header: `(Int)`, the parenthesized parameter types
  (one `Int`, matching `double`'s own single parameter), `->`, syntax
  separating a function type's parameters from its return type, `Int`,
  the return type (matching `double`'s own declared `: Int`).
  `::double`, a **function reference**, given full treatment in this
  lesson's Header, evaluates to a real value of exactly that function
  type — `double` itself, referenced by name, not invoked.
- **`transform(5)`** — calling the value `transform` holds, using
  ordinary call syntax, the same parentheses-with-arguments shape given
  full treatment in Lesson 0.2 for calling `add`. Because `transform`
  holds `double`, this runs `double`'s own body with `n` bound to `5`.

### CS Lens

Treating a function as an ordinary value — storable, passable,
comparable in shape to other functions of the same signature — rather
than only ever being something invoked by a fixed name, is one of the
oldest and most consequential ideas in programming language design,
predating most of the languages this curriculum will ever mention.
Also recognized in: a callback registered with a UI button, handed to
the button as a value rather than the button needing to know the
callback's name in advance; a sorting algorithm's own comparison
function, supplied as an argument rather than hard-coded into the sort
itself; a strategy pattern in traditional object-oriented design,
solving with a whole class hierarchy exactly what a function value
solves in one line; a spreadsheet formula referencing another cell's
own formula rather than its current computed value.

### SE Lens

`::double` requires `double` to already exist, declared by name,
somewhere else in the program — a real constraint this unit's own
example accepts without comment, because `double` genuinely is a
function worth naming and reusing. The next unit's own Problem asks
what happens when a function is needed only once, at exactly one call
site, where writing a whole separate named declaration purely to
reference it once would be needless ceremony — a real tradeoff this
lesson's own next unit resolves directly, not one this unit's design
ignores.

### Commands Needed

No new commands — the same `kotlinc ... -include-runtime -d ...` /
`java -jar ...` pair from Lesson 0.1.

### Run It

Real output, `CollectionTools.kt` at its current state (verified this
session as `lab1_function_type_reference.kt`):

```
$ kotlinc CollectionTools.kt -include-runtime -d CollectionTools.jar
$ java -jar CollectionTools.jar
```

Real output:

```
10
```

### Connect

`double`, an ordinary named function, is now genuinely a value,
callable through a variable holding a reference to it. The next unit
asks what happens when there's no existing named function to reference
at all.

---

## Concept Unit: Lambdas

### The Problem

`::double` only works because `double` was already declared, by name,
somewhere in the file. Given `transform`'s own function type,
`(Int) -> Int`, and given that a function's entire *identity*, as far
as that type is concerned, is just its shape — one `Int` in, one `Int`
out — do you think a function value actually needs a permanent, named
declaration to exist at all? What do you think the smallest possible
way to write "a function taking one `Int`, doubling it" might look
like, if it never needed to be called by name from anywhere else in
the program?

### Project Change

- **Reference Source** — no reference counterpart; from-scratch, per
  the BRD's `Lambdas` concept for this lesson.
- **Files affected** — modified: `CollectionTools.kt`.
- **Change type** — replace (`::double` becomes an inline lambda; the
  separate `double` function declaration is removed).
- **Location** — the `fun double(...)` declaration and the
  `val transform: (Int) -> Int = ::double` line, both from Concept
  Unit 1.
- **Dependencies** — none beyond Concept Unit 1.

### The New Code

```kotlin
val transform: (Int) -> Int = { n -> n * 2 }
```

### The Updated Project

```kotlin
1: fun main() {
2:     val transform: (Int) -> Int = { n -> n * 2 }  // ← changed: replaces `::double`, `double` itself removed
3:     println(transform(5))
4: }
```

`double`'s own separate declaration is gone — its entire body now lives
directly inside the braces assigned to `transform`, with nothing else
in the file needing to know it by any name at all.

### Introduce the Concept in Isolation

The New Code above is this unit's own demonstration. Compiled and run
this session (`verification/0.9/lab2_lambda.kt`, identical to the code
shown above):

```
$ kotlinc lab2_lambda.kt -include-runtime -d lab2_lambda.jar
$ java -jar lab2_lambda.jar
```

Real output:

```
10
```

The identical result Concept Unit 1 produced with `::double` — proving
this rewrite changed *how* the function is written, not what it does.
`{ n -> n * 2 }` is called a **lambda expression**: `{` `}` bound the
whole thing, `n` is a parameter (declared the same way any function's
parameter is, per Lesson 0.2, just without a surrounding `fun name(...)
: Type`), `->` separates the parameter list from the body, and `n * 2`
is the body's own single expression, whose value becomes the lambda's
own return value with no explicit `return` needed.

A second scratch file, `verification/0.9/break2_lambda_wrong_arity.kt`,
checks whether a lambda's own shape is actually checked against the
function type it's assigned to, or just trusted:

```kotlin
fun main() {
    val transform: (Int) -> Int = { a, b -> a + b }
    println(transform(5))
}
```

Compiled this session (deliberately, to observe the failure):

```
$ kotlinc break2_lambda_wrong_arity.kt -include-runtime -d break2_lambda_wrong_arity.jar
```

Real compiler output — this file was never run:

```
break2_lambda_wrong_arity.kt:2:33: error: initializer type mismatch: expected '(Int) -> Int', actual '(Int, ??? (Unknown type for value parameter b)) -> Int'.
    val transform: (Int) -> Int = { a, b -> a + b }
                                ^
break2_lambda_wrong_arity.kt:2:40: error: cannot infer type for value parameter 'b'. Specify it explicitly.
    val transform: (Int) -> Int = { a, b -> a + b }
                                       ^
```

A lambda with two parameters was assigned to a variable declared to
hold a one-parameter function type, and the compiler rejected it
outright — proving a lambda's own shape is checked exactly as strictly
as every other type this curriculum has met, not merely trusted because
it has no separate declaration of its own to check against.

### Discard the Throwaway Example

`break2_lambda_wrong_arity.kt` is scratch, recorded in the verification
folder, not part of `CollectionTools.kt`. What it proved — that a
lambda's parameter count and types are checked against its target
function type — is exactly what makes `{ n -> n * 2 }`, above, safe to
trust wherever `(Int) -> Int` is expected.

### Mechanical Walkthrough

Every distinct syntactic element in the New Code:

- **`val transform: (Int) -> Int = { n -> n * 2 }`** — `val` and the
  explicit function-type annotation, unchanged in meaning from Concept
  Unit 1, both given full treatment in this lesson's Header and Lesson
  0.1. `{ n -> n * 2 }` is a **lambda expression**, given full
  treatment in this lesson's Header: `{` `}` delimit it; `n` is a
  parameter, its type (`Int`) inferred from `transform`'s own declared
  function type rather than written explicitly, the same type
  inference Lesson 0.1 proved for `val`; `->` separates the parameter
  from the body; `n * 2` is the body — an expression calling the real
  `Int.times` this curriculum proved in Lesson 0.2 — whose value is
  what the lambda returns, with no `return` keyword written, unlike an
  ordinary function's block body given full treatment in Lesson 0.2.

### CS Lens

Writing a function anonymously, inline, at the exact point it's
needed, rather than requiring every function to have a permanent,
separately-declared name, is a widespread idea across programming, not
unique to Kotlin's own lambda syntax. Also recognized in: an anonymous
function passed directly to `setTimeout` in JavaScript; a Python
`lambda` expression, the same underlying idea Kotlin's own term borrows
its name from; a one-off mathematical function defined inline inside a
larger expression, `f(x) = x²` written and used within a single
calculation rather than named and filed away; a sticky note's own
one-time instruction, written for a single specific moment rather than
filed in a permanent reference binder.

### SE Lens

A lambda's own convenience — no separate declaration, no name to
maintain — is also its real limit: `{ n -> n * 2 }` cannot be reused by
name from anywhere else in the program the way `::double` could,
because it has no name at all. This lesson's own two units together
state the actual tradeoff plainly: reach for a named function and
`::reference` it (Concept Unit 1) when the same behavior is genuinely
needed in more than one place, or is complex enough to deserve its own
name a reader could search for; reach for an inline lambda (this unit)
when a function value is needed exactly once, at exactly one call site,
where a separate top-level declaration would only exist to be
referenced from that one place and nowhere else.

### Commands Needed

No new commands.

### Run It

Real output, `CollectionTools.kt` at its current state (verified this
session as `lab2_lambda.kt`):

```
$ kotlinc CollectionTools.kt -include-runtime -d CollectionTools.jar
$ java -jar CollectionTools.jar
```

Real output:

```
10
```

Identical to Concept Unit 1's own output.

### Connect

A function's entire body can now be written anonymously, inline, with
no separate declaration anywhere. The next unit puts lambdas to real
use, supplying them to functions that expect one.

---

## Concept Unit: Higher-Order Functions, `map`, and `filter`

### The Problem

Every lambda so far has been assigned to a `val` and called directly —
useful for proving the mechanism, but not yet the actual reason lambdas
matter in real Kotlin code. Lesson 0.4 already built `contacts`, a real
`List<String>`, and processed it entirely with hand-written `for` loops
— visiting every element, checking a condition, deciding what to do,
all written out by hand each time. Given that a lambda is now a real
value that can be passed anywhere a function type is expected, what do
you think a `List`'s own method could look like if it accepted a
lambda as one of its arguments — stating, in one line, "do this to
every element" or "keep only the elements where this is true," without
a hand-written loop at the call site at all? Would you expect such a
method to need to know anything about *what* the lambda does, beyond
its declared shape?

### Project Change

- **Reference Source** — no reference counterpart; from-scratch,
  fulfilling the BRD's "Sort/filter collections" practice item for
  this lesson.
- **Files affected** — modified: `CollectionTools.kt`.
- **Change type** — add (four new lines, replacing the single-value
  `transform` demonstration with a real list-processing example).
- **Location** — replacing the body of `main` from Concept Unit 2.
- **Dependencies** — none beyond Concept Units 1–2.

### The New Code

```kotlin
val numbers = listOf(1, 2, 3, 4, 5, 6)
val doubled = numbers.map { n -> n * 2 }
println(doubled)
val large = numbers.filter { n -> n > 3 }
println(large)
```

### The Updated Project

```kotlin
1: fun main() {
2:     val numbers = listOf(1, 2, 3, 4, 5, 6)   // ← new
3:     val doubled = numbers.map { n -> n * 2 }   // ← new
4:     println(doubled)                            // ← new
5:     val large = numbers.filter { n -> n > 3 }    // ← new
6:     println(large)                                // ← new
7: }
```

Concept Unit 2's own single-value `transform` demonstration is gone —
its teaching job is done, and this unit's own new code is a complete,
self-contained replacement, not an extension of it.

### Introduce the Concept in Isolation

The New Code above is this unit's own demonstration. Compiled and run
this session (`verification/0.9/lab3_map_filter.kt`, identical to the
code shown above):

```
$ kotlinc lab3_map_filter.kt -include-runtime -d lab3_map_filter.jar
$ java -jar lab3_map_filter.jar
```

Real output:

```
[2, 4, 6, 8, 10, 12]
[4, 5, 6]
```

`numbers.map { n -> n * 2 }` produced a new list, every original value
doubled, in the same order — no `for` loop, no manually-built result
list, none of the mechanics Lesson 0.4 wrote by hand. `numbers.filter {
n -> n > 3 }` produced a second new list holding only `4`, `5`, and
`6` — every value from `numbers` that satisfies `n > 3`, in their
original relative order, `1`, `2`, and `3` excluded entirely. `map` and
`filter` are each called **higher-order functions**, given full
treatment in this lesson's Header: functions that themselves accept a
function — here, a lambda — as one of their own arguments.

### Discard the Throwaway Example

This unit's own demonstration remains inside `CollectionTools.kt` for
the rest of this lesson's own narrative purposes, and the identical
code is separately recorded, standalone, in the verification folder.
Per this lesson's Closing, the entire file is discarded once this
lesson ends, exactly like Lesson 0.4's own `ContactSearch.kt`.

### Mechanical Walkthrough

Every distinct syntactic element in the New Code:

- **`val numbers = listOf(1, 2, 3, 4, 5, 6)`** — `listOf`, given full
  treatment in Lesson 0.4, building a `List<Int>` from six `Int`
  literals, all given full treatment in Lesson 0.1.
- **`numbers.map { n -> n * 2 }`** — `List.map`, given full treatment
  in this lesson's Header — a **higher-order function**, called on
  `numbers` using the same dot-access method-call syntax given full
  treatment in Lesson 0.6; `{ n -> n * 2 }`, a **lambda expression**,
  given full treatment in Concept Unit 2, supplied as `map`'s own
  `transform` argument — Kotlin's trailing-lambda syntax lets a
  lambda passed as a function's last (here, only) argument be written
  directly after the closing parenthesis of the call, with the
  parentheses themselves omitted entirely when, as here, it's the only
  argument.
- **`println(doubled)`** — the same overloaded, `inline`,
  `System.out.println`-delegating function given full treatment in
  Lesson 0.1, resolving to the general `Any?` overload since a `List`
  is not one of `println`'s specifically-typed overloads, calling
  `doubled`'s own real `toString()`, given full treatment in Lesson
  0.4 for `List`'s `[element, element, ...]` format.
- **`numbers.filter { n -> n > 3 }`** — `List.filter`, given full
  treatment in this lesson's Header, called on the same `numbers` list;
  `{ n -> n > 3 }`, a lambda whose body, `n > 3`, calls the real
  `Int.compareTo`, given full treatment in this lesson's Header,
  producing a `Boolean` — `filter`'s own declared parameter type,
  `(T) -> Boolean`, requires exactly this shape.
- **`println(large)`** — the same `println` overload as above, printing
  the filtered list's own `toString()`.

### CS Lens

Expressing "transform every element" or "keep only the matching
elements" as a single, direct call — naming the *intent* rather than
hand-writing the *mechanism* (a loop, an index, a growing result list)
every single time — is one of the most consequential shifts in how
collections get processed across modern programming, well beyond
Kotlin. Also recognized in: SQL's own `SELECT ... WHERE` and computed
columns, stating what rows and values are wanted without specifying how
the database engine actually retrieves them; JavaScript's own
`array.map`/`array.filter`, functionally identical to Kotlin's;
Python's list comprehensions, expressing the same "transform" and
"keep only" ideas with different syntax; a factory's quality-control
line, described as "keep only the parts passing inspection" rather
than a step-by-step procedure for physically sorting them by hand.

### SE Lens

Lesson 0.4's own `for`-loop version of "keep only the matching
elements" (its own real search logic) and this unit's `filter` both
produce correct results — `filter` was not introduced because the loop
was wrong. The real difference: a `for` loop states *how* to get the
result (visit each element, check a condition, conditionally act), and
a reader has to trace through that mechanism to recover *what* the code
is actually trying to do; `numbers.filter { n -> n > 3 }` states the
*what* directly, in one line, and the *how* is `filter`'s own concern,
proven correct once, by its real stdlib implementation, and reused
correctly every time it's called. The real cost: `filter` and `map`
only fit the specific shapes they're built for (transform every
element; keep only matching ones) — Lesson 0.4's own hand-written
search, finding one specific match and stopping there conceptually
even though it didn't literally short-circuit, is a different shape
neither one directly expresses, and reaching for a `for` loop remains
the right tool the moment a real need doesn't fit one of these
established, named shapes.

### Commands Needed

No new commands.

### Run It

Real output, `CollectionTools.kt`'s state for this unit (verified this
session as `lab3_map_filter.kt`, identical to the code shown above —
this lesson's own final Concept Unit does not modify
`CollectionTools.kt` further, since Concept Unit 4's own new material
lives entirely in `Calculator.kt` and isolated labs):

```
$ kotlinc CollectionTools.kt -include-runtime -d CollectionTools.jar
$ java -jar CollectionTools.jar
```

Real output:

```
[2, 4, 6, 8, 10, 12]
[4, 5, 6]
```

### Connect

`map` and `filter` now replace what a hand-written `for` loop used to
do, stating intent directly. The last unit in this lesson brings
lambdas back to `Calculator.kt` itself, letting a lambda satisfy an
interface directly.

---

## Concept Unit: Functional Interfaces and SAM Conversion

### The Problem

`Operation`, since Lesson 0.7, requires a whole named class —
`Addition`, `Subtraction`, and so on — each one existing purely to
provide one single method, `apply`. Given that this lesson has already
proven a lambda can stand in for an ordinary function value passed to
`map` or `filter`, and given that `Operation` itself declares exactly
one method, what do you think it would take to let a lambda satisfy
`Operation`'s own contract directly — no `class`, no `override`, no
name of its own — the same way `{ n -> n * 2 }` satisfied `map`'s own
`transform` parameter? Would you expect this to work for *any*
interface with one method, or something special about `Operation`
specifically?

### Project Change

- **Reference Source** — no reference counterpart; from-scratch, per
  the BRD's `Higher-order functions`/`Lambdas` concepts, applied to
  `Calculator.kt`'s own real project code for this lesson, per this
  curriculum's own "Transfer: Critical for idiomatic Kotlin and
  Compose" note.
- **Files affected** — modified: `Calculator.kt`.
- **Change type** — configure (adding the `fun` modifier to an existing
  declaration — no other line in `Calculator.kt` changes).
- **Location** — the `interface Operation { ... }` declaration from
  Lesson 0.7.
- **Dependencies** — none beyond Lesson 0.7.

### The New Code

```kotlin
fun interface Operation {
    fun apply(current: Int, amount: Int): Int
}
```

### The Updated Project

```kotlin
1: fun interface Operation {          // ← changed: `interface` → `fun interface`
2:     fun apply(current: Int, amount: Int): Int
3: }
```

Every other line in `Calculator.kt` — `Addition`, `Subtraction`,
`Multiplication`, `Division`, `Calculator`, `Operator`, `Calculation`,
and `main` — is untouched; `Operation`'s own required method and every
existing class implementing it are exactly as Lesson 0.8 left them.

### Introduce the Concept in Isolation

A disposable scratch file (`verification/0.9/lab4_fun_interface.kt`),
using a fresh, unrelated interface, to confirm this is a general
Kotlin capability, not something specific to `Operation`:

```kotlin
fun interface Transformer {
    fun transform(value: Int): Int
}

fun main() {
    val doubler: Transformer = Transformer { value -> value * 2 }
    println(doubler.transform(5))
}
```

Compiled and run this session:

```
$ kotlinc lab4_fun_interface.kt -include-runtime -d lab4_fun_interface.jar
$ java -jar lab4_fun_interface.jar
```

Real output:

```
10
```

`Transformer { value -> value * 2 }` built a real object implementing
`Transformer` — no `class`, no `override`, nothing but a lambda handed
directly to the interface's own name, called like a constructor. This
is called **SAM conversion**: `Transformer` declares exactly one
method (its **single abstract method**), and marking it `fun interface`
lets the compiler build a real implementation from a lambda alone,
because there's no ambiguity about which method the lambda's own body
is providing — there's only one to provide.

A second scratch file (`verification/0.9/lab5_operation_as_lambda.kt`)
applies this directly to a rebuilt, minimal version of the calculator's
own real types, reusing Lesson 0.7's own "average" example:

```kotlin
fun interface Operation {
    fun apply(current: Int, amount: Int): Int
}

class Calculator(var displayValue: Int) {
    fun perform(operation: Operation, amount: Int) {
        displayValue = operation.apply(displayValue, amount)
    }
}

fun main() {
    val calculator = Calculator(17)
    val average = Operation { current, amount -> (current + amount) / 2 }
    calculator.perform(average, 5)
    println(calculator.displayValue)
}
```

Compiled and run this session:

```
$ kotlinc lab5_operation_as_lambda.kt -include-runtime -d lab5_operation_as_lambda.jar
$ java -jar lab5_operation_as_lambda.jar
```

Real output:

```
11
```

`(17 + 5) / 2 = 11` — the identical result Lesson 0.7's own
`lab4_composition.kt` produced with a full `class Average : Operation
{ ... }` declaration, here built with one line, `Operation { current,
amount -> (current + amount) / 2 }`, instead. `Calculator.perform`
itself — unchanged, character for character, from Lesson 0.7 — never
needed to know or care that this particular `Operation` came from a
lambda rather than a named class; the same polymorphism Lesson 0.7
proved for `Addition`/`Subtraction`/`Multiplication`/`Division` applies
identically here.

### Discard the Throwaway Examples

`lab4_fun_interface.kt` and `lab5_operation_as_lambda.kt` are scratch,
recorded in the verification folder, not part of the calculator
project. What they proved — that a `fun interface`'s one method can be
satisfied directly by a lambda, and that this works identically for
`Operation`'s own real shape — is exactly what `Operation`'s real
`fun` modifier, above, unlocks for `Calculator.kt`, without requiring
any of its own existing classes to actually be rewritten.

### Mechanical Walkthrough

Every distinct syntactic element in the New Code:

- **`fun interface Operation`** — `interface`, given full treatment in
  Lesson 0.7, now preceded by `fun` — a **functional interface**, given
  full treatment in this lesson's Header, stating `Operation` has
  exactly one required method, and that a lambda may satisfy it
  directly; `Operation`, the identifier, unchanged.
- **`fun apply(current: Int, amount: Int): Int`** — unchanged from
  Lesson 0.7, full treatment already given there: the interface's one
  declared method, no body, stating the shape any implementation —
  class or lambda — must provide.

### CS Lens

Recognizing that an interface with exactly one method is, in every
practical sense, just a named function type — and letting a lambda
satisfy it as cheaply as it satisfies an ordinary function-typed
parameter — is a real convergence between two ideas that look
different on the surface (object-oriented interfaces, and functional
values) but describe the identical underlying contract. Also recognized
in: Java's own `@FunctionalInterface`-annotated interfaces
(`Runnable`, `Comparator`), which is precisely what inspired Kotlin's
own `fun interface`; a light switch's single "toggle" action, whether
implemented as a physical lever, a voice command, or an app button —
the *contract* (one action, one effect) is identical regardless of
implementation; a restaurant's "call this number to order" instruction,
satisfied identically whether answered by a human, a recording, or an
automated system, because the contract is exactly one thing: take the
order.

### SE Lens

`Addition`, `Subtraction`, `Multiplication`, and `Division` remain
real, named classes in `Calculator.kt`'s own project code — this
lesson does not rewrite them as lambdas, even though it now could.
That's a deliberate choice, not an oversight: a named class states,
permanently, in the type system itself, "this is Addition" — searchable
by name, referenced the same way anywhere in a larger codebase, a real
asset once Stage 6's scientific functions add many more operations
that genuinely deserve their own clear names. A lambda's own real
strength is the opposite case: a one-off, throwaway, or dynamically
constructed operation that doesn't need a permanent name at all — proven
directly by this unit's own `average` lab. Marking `Operation` as `fun
interface` costs nothing and forecloses nothing — every existing class
still implements it exactly as before — while opening the door for
lighter-weight operations later without forcing a class-heavy pattern
onto every future case that doesn't actually need one.

### Commands Needed

No new commands.

### Run It

`Calculator.kt`'s own `main` function is unchanged by this unit — the
`fun` modifier only widens what *can* implement `Operation`, and
nothing in `main` constructs an `Operation` from a lambda. Real output,
`Calculator.kt`'s complete, final state for this lesson (verified this
session as `step4_fun_interface_operation.kt`):

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

Identical to Lesson 0.8's own final output — proving the `fun` modifier
changed what's *possible*, not what the existing, unmodified program
actually does.

### Connect

`Operation` can now be satisfied by a class or a lambda, proven both
generically and against the calculator's own real shape, with zero
change to any of its four existing implementations. This is the last
new concept this lesson introduces.

---

## Connect the Pieces

Follow a function's own journey from named declaration to anonymous
value across every unit this lesson built:

1. Concept Unit 1: `double`, an ordinary named function (full treatment
   given in Lesson 0.2), becomes a real value via `::double` — a
   **function reference** held in a variable typed `(Int) -> Int`, a
   **function type**, and called through that variable exactly as
   calling `double` directly would.
2. Concept Unit 2: the identical behavior is rewritten as
   `{ n -> n * 2 }`, a **lambda expression** — proven, by a real
   compiler error against a wrong-arity version, to be checked exactly
   as strictly as any other typed value in this curriculum.
3. Concept Unit 3: lambdas move from being called directly to being
   *passed* — `numbers.map { n -> n * 2 }` and
   `numbers.filter { n -> n > 3 }`, each a **higher-order function**,
   given full treatment in this lesson's Header, using real,
   `javap`-adjacent verified stdlib source, fulfilling this
   curriculum's own standing promise (recorded since Lesson 0.4) that
   `map`/`filter` would be covered once lambdas existed.
4. Concept Unit 4: `Operation`, the calculator's own real interface
   from Lesson 0.7, gains the `fun` modifier — a **functional
   interface** — and a lambda alone, `Operation { current, amount ->
   (current + amount) / 2 }`, satisfies it directly, proven to produce
   the identical `11` Lesson 0.7's full `class Average : Operation`
   declaration required, verified through `Calculator.perform`'s own
   real, unmodified polymorphic dispatch from Lesson 0.7.

`CollectionTools.kt` is discarded here, its teaching job complete —
`Calculator.kt` itself changed by exactly one word, `fun`, added before
`interface Operation`, unlocking a genuinely new way to satisfy a
contract this curriculum built three lessons ago, without touching
anything that already worked. Lesson 0.10 picks `Calculator.kt` back up
to review and tighten its idioms before Slice 0 ships.
