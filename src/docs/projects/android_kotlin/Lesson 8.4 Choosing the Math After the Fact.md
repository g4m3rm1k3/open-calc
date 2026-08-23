# Lesson 8.4: Choosing the Math After the Fact

*Strategy Pattern*

- **What you will build.** A real, permanent `MatrixOperation` interface,
  and two real, permanent, named singleton implementations of it,
  `MatrixAddition` and `MatrixMultiplication` — `Matrix`'s own existing
  `add` and `multiply` methods, pulled out from behind `Matrix` itself
  and rebuilt as objects any code can hold, pass around, and choose
  between, all *without* that calling code needing to know, at compile
  time, which one it's actually going to run. Along the way, this lesson
  also investigates a real, concrete gap: this project's own BRD-planned
  third matrix operation, a real matrix inverse, and finds — with real,
  executed, decisive proof, not a guess — exactly why it can't be built
  yet, honestly deferred rather than forced.
- **What you need to know first.** This lesson's own three direct
  predecessors — `Matrix`'s real `add`, `multiply`, `rows`, `cols`, and
  `get`; this project's own earlier, already-shipped
  `Operation`/`Operator` design (a real interface, `Addition` and
  `Multiplication` among several real, named implementations, chosen
  polymorphically per keypad button) for scalar arithmetic; Lesson 0.6's
  own classes and Lesson 0.7's own interfaces and polymorphism.

## Terms used in this lesson

- **Strategy pattern** — a real, named object-oriented design pattern:
  define a common interface for a family of interchangeable behaviors,
  give each behavior its own real, separate implementation, and let
  calling code hold a reference to the *interface* type rather than any
  one specific implementation — so which real behavior actually runs is
  decided by which implementation is handed over, not by anything
  written inside the calling code itself. This exists so new behaviors
  can be added later without ever touching the code that already knows
  how to use the interface.
- **`object` declaration** — a Kotlin construct declaring a class with
  exactly one real instance, created automatically the first time it's
  referenced, with no visible constructor call anywhere in code that
  uses it — there is no `MatrixAddition(...)`, only the name
  `MatrixAddition` itself, already a usable value. This exists because a
  real Strategy-pattern implementation, like `MatrixAddition`, genuinely
  never needs more than one instance — it holds no data of its own, only
  behavior — so a full class, with its own constructor and the
  possibility of multiple instances, would be real, unnecessary
  flexibility nothing in this project would ever use.
- **Integer division truncation** — the real, defined behavior of
  Kotlin's `/` operator when both operands are `Int`: the mathematically
  exact result is computed, then its fractional part is discarded
  entirely (not rounded), keeping only the whole-number part. This
  exists because `Int` itself has no way to represent a fractional
  value at all — `/` on two `Int`s has to return some real `Int`, and
  truncation is the specific, defined rule Kotlin (inherited from Java,
  and from C before it) uses to pick which one.

## Objects and methods used

- **`MatrixOperation`**
  - *What it is:* this lesson's own new, permanent, from-scratch
    interface — the real contract every interchangeable matrix operation
    this project builds from here forward implements.
  - *Implementation:* `interface MatrixOperation { fun apply(a: Matrix, b: Matrix): Matrix }`
    — one abstract method, taking two real `Matrix` values and returning
    a third.
  - *Its use:* this is the real, shared shape `MatrixAddition` and
    `MatrixMultiplication`, below, both implement — the actual mechanism
    that lets a single piece of calling code work with either one
    interchangeably.
  - *Type:* an interface — a real contract with no storage or behavior
    of its own.
  - *Responsibility:* to guarantee that any real value typed as
    `MatrixOperation` can be called with exactly two `Matrix` arguments
    and will hand back a real, third `Matrix` — nothing about what
    arithmetic actually happens inside.
  - *Depends on:* a real, concrete implementing `object` or class to
    supply real behavior; the interface itself has none.
  - *Connects to:* implemented by `MatrixAddition` and
    `MatrixMultiplication`, below; a variable or parameter typed
    `MatrixOperation` can hold either one, deciding at runtime which
    real `apply` body actually executes.
  - *Shape:* a public, permanent domain interface — this project's own
    Matrix-flavored counterpart to the already-established `Operation`
    interface its own scalar calculator keypad already uses.
- **`MatrixAddition`**
  - *What it is:* a real, permanent, singleton object — this project's
    own real Strategy-pattern implementation of matrix addition,
    replacing what used to be `Matrix.add`'s own entire hand-written
    body.
  - *Implementation:* `object MatrixAddition : MatrixOperation`, whose
    `apply(a: Matrix, b: Matrix): Matrix` checks `a.rows == b.rows && a.cols == b.cols`,
    then returns
    `Matrix((0 until a.rows).map { r -> (0 until a.cols).map { c -> a[r, c] + b[r, c] } })`
    — the identical real computation `Matrix.add` already performed,
    moved here, reading from its own two parameters `a`/`b` instead of a
    receiver `this` and an `other`.
  - *Its use:* `Matrix.add` now calls this directly
    (`MatrixAddition.apply(this, other)`) instead of doing the work
    itself; any other code in this project could call
    `MatrixAddition.apply(...)` the exact same way, with no `Matrix`
    instance required to reach it.
  - *Type:* a singleton `object`, implementing `MatrixOperation`.
  - *Responsibility:* combine two same-shaped matrices, cell by
    corresponding cell, via addition — the identical charter
    `Matrix.add` already had, now living here instead.
  - *Depends on:* two real `Matrix` arguments, `a` and `b`; the real
    `require`, `until`, `map`, and `MatrixOperation` interface itself.
  - *Connects to:* called by `Matrix.add`; itself calls `require`
    (documented below) and constructs a new `Matrix`.
  - *Shape:* a public, permanent domain object — one real, concrete
    Strategy-pattern implementation.
- **`MatrixMultiplication`**
  - *What it is:* a real, permanent, singleton object — this project's
    own real Strategy-pattern implementation of matrix multiplication,
    replacing what used to be `Matrix.multiply`'s own entire
    hand-written body.
  - *Implementation:* `object MatrixMultiplication : MatrixOperation`,
    whose `apply(a: Matrix, b: Matrix): Matrix` checks `a.cols == b.rows`,
    then returns
    `Matrix((0 until a.rows).map { r -> (0 until b.cols).map { c -> (0 until a.cols).sumOf { k -> a[r, k] * b[k, c] } } })`
    — the identical real dot-product computation `Matrix.multiply`
    already performed, moved here.
  - *Its use:* `Matrix.multiply` now calls this directly
    (`MatrixMultiplication.apply(this, other)`).
  - *Type:* a singleton `object`, implementing `MatrixOperation`.
  - *Responsibility:* combine two compatibly-shaped matrices via a real
    dot product per result cell — the identical charter `Matrix.multiply`
    already had, now living here instead.
  - *Depends on:* two real `Matrix` arguments; `require`, `until`, `map`,
    `sumOf`, and `MatrixOperation`.
  - *Connects to:* called by `Matrix.multiply`; itself calls `require`
    and `sumOf`, and constructs a new `Matrix`.
  - *Shape:* a public, permanent domain object — a second, real,
    concrete Strategy-pattern implementation.
- **`require`**
  - *What it is:* the real, top-level Kotlin standard-library
    precondition-checking function, already fully documented in this
    lesson's own predecessor.
  - *Implementation:* `public inline fun require(value: Boolean, lazyMessage: () -> Any): Unit`
    — unchanged from its own already-confirmed real signature, throwing
    a real `IllegalArgumentException` when `value` is `false`.
  - *Its use:* both `MatrixAddition` and `MatrixMultiplication` call it
    to check their own real dimension rule before doing any arithmetic —
    unchanged in purpose from when this exact check lived directly
    inside `Matrix.add`/`Matrix.multiply`.
  - *Type:* a top-level, inline function.
  - *Responsibility:* unchanged from its own already-confirmed real
    responsibility.
  - *Depends on:* unchanged.
  - *Connects to:* called by `MatrixAddition.apply` and
    `MatrixMultiplication.apply`, in place of where it used to be called
    by `Matrix.add`/`Matrix.multiply` directly.
  - *Shape:* unchanged — a public stdlib API surface.
- **`until`**
  - *What it is:* the real, infix Kotlin standard-library function,
    already fully documented in this lesson's own predecessor, building
    a range of consecutive integers.
  - *Implementation:* `public infix fun Int.until(to: Int): IntRange` —
    unchanged from its own already-confirmed real signature.
  - *Its use:* unchanged — both `MatrixAddition` and
    `MatrixMultiplication` use it exactly as `Matrix.add`/`Matrix.multiply`
    already did, to name every valid row and column position.
  - *Type:* an infix extension function on `Int`.
  - *Responsibility:* unchanged — to produce one real `IntRange`
    representing every integer from its start up to, but not including,
    its end.
  - *Depends on:* unchanged — the `Int` receiver (start) and the `to`
    argument (exclusive end).
  - *Connects to:* called directly by `MatrixAddition.apply` and
    `MatrixMultiplication.apply`, in place of where it used to be called
    by `Matrix.add`/`Matrix.multiply` directly; its result is still
    immediately handed to `map`, below.
  - *Shape:* unchanged — a public stdlib API surface.
- **`map`**
  - *What it is:* the real Kotlin standard-library function, already
    fully documented in this lesson's own predecessor, building a new
    list by transforming every element of an existing collection.
  - *Implementation:* `public inline fun <T, R> Iterable<T>.map(transform: (T) -> R): List<R>`
    — unchanged.
  - *Its use:* unchanged — the same nested `map`-over-`until` shape,
    relocated from `Matrix.add`/`Matrix.multiply` into
    `MatrixAddition`/`MatrixMultiplication` without any change to how it
    itself works.
  - *Type:* a generic, inline extension function on `Iterable<T>`.
  - *Responsibility:* unchanged — to produce exactly one new output
    element per input element, in order.
  - *Depends on:* unchanged — the receiver collection and a `transform`
    function.
  - *Connects to:* called on ranges from `until`, nested inside itself,
    inside `MatrixAddition.apply` and `MatrixMultiplication.apply` now,
    exactly as already established for `Matrix.add`/`Matrix.multiply`.
  - *Shape:* unchanged — a public, foundational stdlib API surface.
- **`sumOf`**
  - *What it is:* the real Kotlin standard-library function, already
    fully documented in this lesson's own predecessor, adding up a
    number computed from every element of a collection into one total.
  - *Implementation:* `public inline fun <T> Iterable<T>.sumOf(selector: (T) -> Int): Int`
    — unchanged.
  - *Its use:* unchanged — `MatrixMultiplication`'s own real dot-product
    calculation, relocated from `Matrix.multiply` without any change to
    how it itself works.
  - *Type:* a generic, inline extension function on `Iterable<T>`.
  - *Responsibility:* unchanged — to compute one running total by calling
    `selector` once per element and adding each result.
  - *Depends on:* unchanged — the receiver collection and a `selector`
    function.
  - *Connects to:* called on a range from `until`, inside
    `MatrixMultiplication.apply` now, exactly as already established for
    `Matrix.multiply`.
  - *Shape:* unchanged — a public stdlib API surface.
- **`toDouble`**
  - *What it is:* a real, standard Kotlin conversion function, defined on
    every numeric type, producing a real `Double` holding the same
    numeric value as the original `Int`.
  - *Implementation:* `public actual fun Int.toDouble(): Double`, a real
    member of `Int` itself (part of Kotlin's own numeric-type contract,
    every numeric type providing a `to___` conversion to every other
    one), confirmed from the real, current source in
    `kotlin-stdlib-sources.jar`.
  - *Its use:* this lesson's own second unit uses it to convert a real,
    already-computed `Int` determinant into a real `Double` *before*
    dividing by it — the exact, real fix that turns integer division's
    own truncation off.
  - *Type:* a member function on `Int`.
  - *Responsibility:* to produce a real `Double` with the same
    mathematical value as the `Int` it's called on — never rounding or
    truncating anything itself, since converting a whole number to a
    floating-point type loses nothing.
  - *Depends on:* the `Int` receiver it's called on.
  - *Connects to:* called directly by this lesson's own second lab; its
    real `Double` result changes which overload of `/`, below, gets
    resolved at every division in the same expression.
  - *Shape:* a public stdlib API surface — the standard, idiomatic way to
    move a whole-number value into floating-point arithmetic in Kotlin.

Every real signature quoted above was fetched and confirmed from the
genuine, currently-installed `kotlin-stdlib-sources.jar` this session (or
already confirmed there in this lesson's own predecessor and restated
here in full, per this schema's Repetition Rule), not written from
memory.

## Concept Unit: The Strategy Pattern

### The Problem

`Matrix.add` and `Matrix.multiply` both work correctly today — but both
are hand-written directly inside `Matrix` itself, reachable only by
calling a method *on* a specific `Matrix` instance. There's no real way,
right now, to hold "the operation of adding two matrices" as a value on
its own — to pass it to another function, store it, or decide which
operation to run *later*, based on something other than which method
name gets typed at the call site. This project's own scalar calculator
already solved exactly this problem once, for `Int` arithmetic, with its
own real `Operation` interface and real, named `Addition`/`Multiplication`
implementations, chosen by whichever keypad button was actually pressed.
Does the identical real shape work for `Matrix`, too?

> This project's own scalar `Operation` interface already has exactly
> one abstract method, taking two real values and returning a third.
> Given that `Matrix.add` and `Matrix.multiply` both already take one
> real `Matrix` parameter and (via their own receiver) act on a second,
> what would the equivalent matrix-flavored interface's own single
> method signature need to look like? And once real implementations of
> that interface exist, what real Kotlin construct would you use to
> declare each one as a single, reusable value, the same way the
> original `Addition`/`Multiplication` classes did for scalar
> arithmetic?

### Introduce the Concept in Isolation

```kotlin
interface LabCombiner {
    fun combine(a: Int, b: Int): Int
}

object LabAdd : LabCombiner {
    override fun combine(a: Int, b: Int): Int = a + b
}

object LabMultiply : LabCombiner {
    override fun combine(a: Int, b: Int): Int = a * b
}

fun runCombiner(combiner: LabCombiner, a: Int, b: Int): Int = combiner.combine(a, b)

fun main() {
    println(runCombiner(LabAdd, 3, 4))
    println(runCombiner(LabMultiply, 3, 4))
}
```

Run for real, batch-compiled with this lesson's other lab via a single
`kotlinc` pass (see Commands Needed, below):

```
7
12
```

This real, executed output proves the real mechanism: `runCombiner`'s
own body never changes between the two calls — it calls
`combiner.combine(a, b)` exactly once, the same real line of code both
times — yet the first call prints `7` (real addition) and the second
prints `12` (real multiplication), because `runCombiner` was handed a
genuinely different real object each time. `LabAdd` and `LabMultiply`
are each declared with `object`, not `class` — a real, singleton
**`object` declaration**: there is no `LabAdd(...)` constructor call
anywhere in this lab, only the bare name `LabAdd`, already a usable
value the moment it's referenced. This entire shape — one shared
interface, several interchangeable real implementations, calling code
that depends only on the interface — is called the **Strategy pattern**.

### Discard the Throwaway Example

`LabCombiner`, `LabAdd`, `LabMultiply`, and `runCombiner` are discarded
now — but the exact real shape they just proved is what `Matrix`'s own
`add` and `multiply` need next.

### Project Change

- **Reference Source** — this project's own already-shipped
  `Operation`/`Operator`/`Addition`/`Multiplication` design, in
  `Calculator.kt`, is the real design this unit ports the same idea
  from — not copied verbatim (that design is scalar-`Int`-shaped, this
  one is `Matrix`-shaped), but the same real Strategy-pattern structure,
  applied to a new domain.
- **Files affected** —
  `app/src/main/java/com/example/calculator/Matrix.kt` (both the
  interface/objects added and `Matrix.add`/`Matrix.multiply` themselves
  changed); a new test file,
  `app/src/test/java/com/example/calculator/MatrixOperationTest.kt`.
- **Change type** — add (the new interface and two new objects) and
  refactor (`Matrix.add`/`Matrix.multiply`, changed from full
  implementations to one-line delegations).
- **Location** — the new interface and objects are added at the end of
  `Matrix.kt`, after the closing brace of the `Matrix` class itself;
  `add` and `multiply` are replaced in place, at their existing
  positions inside `Matrix`.
- **Dependencies** — `Matrix`'s own `rows`, `cols`, and `get`, all
  already real; nothing new beyond what `Matrix.kt` already had.

### The New Code

```kotlin
interface MatrixOperation {
    fun apply(a: Matrix, b: Matrix): Matrix
}

object MatrixAddition : MatrixOperation {
    override fun apply(a: Matrix, b: Matrix): Matrix {
        require(a.rows == b.rows && a.cols == b.cols) {
            "Matrices must have the same dimensions to add"
        }
        return Matrix((0 until a.rows).map { r -> (0 until a.cols).map { c -> a[r, c] + b[r, c] } })
    }
}
```

### The Updated Project

```kotlin
1: data class Matrix(private val data: List<List<Int>>) {
2:     val rows: Int = data.size
3:     val cols: Int = if (data.isEmpty()) 0 else data[0].size
4:
5:     init {
6:         require(data.all { it.size == cols }) {
7:             "All rows must have the same number of columns"
8:         }
9:     }
10:
11:    operator fun get(row: Int, col: Int): Int = data[row][col]
12:
13:    fun add(other: Matrix): Matrix = MatrixAddition.apply(this, other) // ← changed
14:
15:    fun subtract(other: Matrix): Matrix {
16:        require(rows == other.rows && cols == other.cols) {
17:            "Matrices must have the same dimensions to subtract"
18:        }
19:        return Matrix((0 until rows).map { r -> (0 until cols).map { c -> this[r, c] - other[r, c] } })
20:    }
21:
22:    fun multiply(other: Matrix): Matrix = MatrixMultiplication.apply(this, other) // ← changed
23:
24:    fun transpose(): Matrix {
25:        return Matrix((0 until cols).map { c -> (0 until rows).map { r -> this[r, c] } })
26:    }
27:
28:    fun determinant(): Int {
29:        require(rows == cols) { "Determinant is only defined for a square matrix" }
30:        require(rows == 2) { "This project's determinant only supports 2x2 matrices for now" }
31:        return this[0, 0] * this[1, 1] - this[0, 1] * this[1, 0]
32:    }
33: }
34:
35: interface MatrixOperation { // ← new
36:     fun apply(a: Matrix, b: Matrix): Matrix // ← new
37: } // ← new
38:
39: object MatrixAddition : MatrixOperation { // ← new
40:     override fun apply(a: Matrix, b: Matrix): Matrix { // ← new
41:         require(a.rows == b.rows && a.cols == b.cols) { // ← new
42:             "Matrices must have the same dimensions to add" // ← new
43:         } // ← new
44:         return Matrix((0 until a.rows).map { r -> (0 until a.cols).map { c -> a[r, c] + b[r, c] } }) // ← new
45:     } // ← new
46: } // ← new
47:
48: object MatrixMultiplication : MatrixOperation { // ← new
49:     override fun apply(a: Matrix, b: Matrix): Matrix { // ← new
50:         require(a.cols == b.rows) { // ← new
51:             "Left matrix's column count must match right matrix's row count to multiply" // ← new
52:         } // ← new
53:         return Matrix((0 until a.rows).map { r -> // ← new
54:             (0 until b.cols).map { c -> // ← new
55:                 (0 until a.cols).sumOf { k -> a[r, k] * b[k, c] } // ← new
56:             } // ← new
57:         }) // ← new
58:     } // ← new
59: } // ← new
```

`Matrix.kt` now defines four real top-level things instead of one:
`Matrix` itself, shrunk by two real method bodies (lines 13 and 22 are
now one-line delegations); `MatrixOperation`, the real shared contract;
and `MatrixAddition`/`MatrixMultiplication`, the real, permanent
Strategy-pattern implementations `add`/`multiply` now delegate to.
`subtract`, deliberately, is untouched — see the SE Lens, below.

**Real, unplanned finding, caught by the real compiler**: this unit's
own first attempt named these two objects `Addition` and `Multiplication`
— the exact names the Header's own "Reference Source" field points at.
A real `./gradlew :app:compileDebugKotlin` run failed immediately, with
two real, specific errors: `Redeclaration: Addition` and
`Redeclaration: Multiplication`, both pointing at `Calculator.kt`.
`Calculator.kt` already declares `private class Addition`/
`private class Multiplication` — its own real, already-shipped scalar
`Operation` implementations. **The real, confirmed fact this proves**:
a top-level `private` declaration in Kotlin is private *to its own
file*, but it still claims its name for the entire package it's
declared in — a second, same-named top-level declaration in a
*different* file of that same package is a real compile error, even
though the first one is invisible outside its own file. The fix: rename
this unit's own two objects to `MatrixAddition`/`MatrixMultiplication`,
genuinely distinct names, real, confirmed to compile clean afterward.

### Mechanical Walkthrough

Every distinct element of the New Code above, in the order it appears:

- `interface MatrixOperation { fun apply(a: Matrix, b: Matrix): Matrix }`
  — an interface declaration (the same real `interface` keyword already
  established for this project's own scalar `Operation`), holding one
  abstract method signature — no body, no default implementation, just
  the contract any real implementation has to satisfy.
- `object MatrixAddition : MatrixOperation` — a real, singleton
  **`object` declaration**, proven in isolation above, whose `:` marks it
  as implementing `MatrixOperation` (the identical real inheritance
  syntax already established for a `class` implementing an interface,
  here used on an `object` instead).
- `override fun apply(a: Matrix, b: Matrix): Matrix` — the real
  `override` keyword (already established), marking this method as
  fulfilling `MatrixOperation`'s own abstract contract, with two real
  parameters named `a` and `b` instead of a receiver `this` and a
  parameter `other` — the real, necessary shift from an instance method
  (called *on* a `Matrix`) to a standalone function (called *with* two
  `Matrix`es), since `MatrixAddition` itself is not a `Matrix`.
- `require(a.rows == b.rows && a.cols == b.cols) { ... }` — the same
  real `require` already fully documented, with its condition rewritten
  to compare `a`'s and `b`'s own properties directly, rather than the
  receiver's and `other`'s — the identical real check, just reading from
  its own two named parameters instead.
- `return Matrix((0 until a.rows).map { r -> (0 until a.cols).map { c -> a[r, c] + b[r, c] } })`
  — the identical real nested `until`/`map` shape already fully
  documented, with every `this` and `other` from the original
  `Matrix.add` body renamed to `a` and `b`, and every real computation
  otherwise byte-for-byte unchanged.

### CS Lens

The Strategy pattern is a real, foundational, named object-oriented
design pattern. Also recognized in: sorting algorithms in many real
standard libraries, where a caller supplies a `Comparator` (a real,
swappable strategy for "which of these two things comes first") without
the sort algorithm itself ever needing to know how comparison actually
works; payment-processing systems, where "how to charge this customer"
(credit card, real-time bank transfer, store credit) is a real,
swappable strategy selected at checkout; and this project's own already-
shipped scalar `Operation`/`Operator` design, the same real pattern,
already proven, for a different, narrower domain.

### SE Lens

The alternative not chosen here is leaving `add`/`multiply` exactly as
they were — real, correct, hand-written methods directly on `Matrix` —
and never introducing `MatrixOperation` at all. That would have been
simpler, and BRD's own sequencing explicitly delayed this exact
refactor until now ("Only now") rather than doing it back when `add` and
`multiply` were first written, specifically so their own real,
already-proven, already-tested bodies existed first, as real material to
refactor, rather than being designed abstractly from the start. The real
cost of the refactor actually done: two new top-level declarations, and
`add`/`multiply` are now one indirection away from their own real logic
— a reader following `Matrix.add` has to follow one more real jump to
reach the actual arithmetic. The real benefit, matching the CS Lens
above: `MatrixAddition`/`MatrixMultiplication` can now be held, passed,
and chosen between as real values, something no plain instance method
could ever do — genuinely useful the moment any future code needs to
decide *which* matrix operation to run without hard-coding a method
name. **A real, deliberate scope limit, recorded honestly**: `subtract`
was left untouched, still a full, hand-written method — BRD's own
`MatrixOperation` list names only `Addition`, `Multiplication`, and
`Inverse`, not `Subtraction`, and refactoring it anyway would have been
real, uninstructed scope creep; `Matrix.kt` now carries a real,
acknowledged asymmetry (two operations behind the Strategy pattern, one
not) rather than a silently "completed" refactor that went further than
either the BRD or this lesson's own real motivation asked for.

### Commands Needed

Both of this lesson's labs were compiled together in one real, batched
pass:

```
$ kotlinc lab1_strategy_pattern.kt lab2_inverse_needs_double.kt -include-runtime -d labs.jar
```

Run on its own with:

```
$ java -cp labs.jar Lab1_strategy_patternKt
```

This unit's real project change was verified with a full
`./gradlew testDebugUnitTest assembleDebug` (see the Closing, below,
which covers both this lesson's units together).

### Run It

```
7
12
```

Real, saved at `verification/8.4/lab1_strategy_pattern.kt` and
`verification/8.4/lab1_strategy_pattern_run.txt`. The real project
change was confirmed via a full, clean `./gradlew testDebugUnitTest assembleDebug`
run, `MatrixOperationTest.kt`'s own three new tests passing alongside
this project's full, existing suite.

### Connect the Pieces

`add` and `multiply` now work exactly as they did before, from any
existing caller's point of view — but the real behavior each one runs
now exists as its own real, independent, nameable value,
`MatrixAddition`/`MatrixMultiplication`, reachable without a `Matrix`
instance at all. The next unit asks whether this same real shape — an
interface, and named objects implementing it — is enough to add this
project's third, BRD-planned matrix operation, or whether that one has a
real, different shape of its own.

## Concept Unit: Why Inverse Has to Wait

### The Problem

BRD's own Slice 8 plan names a third real matrix operation alongside
addition and multiplication: a matrix inverse. For a `2×2` matrix
`[[a, b], [c, d]]` with a real, nonzero determinant, the real, standard
formula is: divide the matrix `[[d, -b], [-c, a]]` by that determinant,
cell by cell. `Matrix` already has a real, working `determinant()`
method (from this lesson's own second predecessor) and a real, working
`get`. Is that enough, on its own, to compute a correct inverse, using
`Matrix`'s own current, `Int`-only cells?

> `Matrix`'s own real `data` is a `List<List<Int>>` — every cell is an
> `Int`, and `Int` has no way to represent a fractional value at all.
> The real inverse formula divides each of four whole numbers by a real
> determinant. Given a concrete example — the matrix `[[4, 3], [2, 1]]`,
> whose real determinant is `-2` — do you expect every one of the four
> real divisions the formula requires to come out to a whole number, or
> could some of them genuinely need a fractional result? If a fractional
> result really is possible, what would Kotlin's own `/` operator,
> applied to two `Int`s, actually do with it — round it, truncate it, or
> refuse to compile at all?

### Introduce the Concept in Isolation

```kotlin
fun intInverseAttempt(a: Int, b: Int, c: Int, d: Int): List<List<Int>> {
    val det = a * d - b * c
    return listOf(listOf(d / det, -b / det), listOf(-c / det, a / det))
}

fun doubleInverse(a: Int, b: Int, c: Int, d: Int): List<List<Double>> {
    val det = (a * d - b * c).toDouble()
    return listOf(listOf(d / det, -b / det), listOf(-c / det, a / det))
}

fun main() {
    println(intInverseAttempt(4, 3, 2, 1))
    println(doubleInverse(4, 3, 2, 1))
}
```

Run for real, from this lesson's own batched compile:

```
[[0, 1], [1, -2]]
[[-0.5, 1.5], [1.0, -2.0]]
```

This real, executed output proves the Socratic prompt's own concern is
real, not hypothetical: for `[[4, 3], [2, 1]]`, whose real determinant is
`-2`, `intInverseAttempt` — using plain `Int` division throughout —
returns `[[0, 1], [1, -2]]`. That is a real, genuinely *wrong* answer:
`1 / -2` should be `-0.5`, not `0`; `-3 / -2` should be `1.5`, not `1`.
Both are silently, exactly wrong by their own fractional part, discarded
completely by **integer division truncation** — Kotlin's own defined
rule that `/` between two `Int`s keeps only the whole-number part of the
real, exact result. `doubleInverse`, converting the determinant to a
real `Double` with `toDouble()` *before* dividing, produces the real,
mathematically correct answer: `[[-0.5, 1.5], [1.0, -2.0]]` — proving the
real fix works, and proving, at the same time, that a correct inverse
genuinely cannot be represented using `Int` cells at all, not even for
this one, perfectly ordinary example.

### Discard the Throwaway Example

`intInverseAttempt` and `doubleInverse` are discarded now — but the real
proof they just produced is permanent: this project's own real `Matrix`,
built entirely on `Int` cells, cannot correctly hold the result of its
own planned inverse operation, for real mathematical reasons, not a
missing feature.

### Mechanical Walkthrough

- `fun intInverseAttempt(a: Int, b: Int, c: Int, d: Int): List<List<Int>>`
  — a function taking the real `2×2` matrix's own four cells as four
  separate `Int` parameters (matching the standard `[[a,b],[c,d]]`
  naming this unit's own Problem section already used), returning a
  `List<List<Int>>`.
- `val det = a * d - b * c` — the same real `2×2` determinant formula
  `Matrix.determinant()` already computes, here inlined directly rather
  than called, since this lab deliberately works with bare `Int`s, not a
  real `Matrix`.
- `return listOf(listOf(d / det, -b / det), listOf(-c / det, a / det))`
  — the real inverse formula's own four divisions, each one plain `Int`
  `/` `Int`, and each one, per **integer division truncation**, keeping
  only the whole part of its own real, exact result — `1 / -2` computes
  the real value `-0.5`, then discards everything after the decimal
  point, leaving `0`, not `-1` (truncation moves *toward* zero, not
  down) and not `-0.5` itself.
- `fun doubleInverse(a: Int, b: Int, c: Int, d: Int): List<List<Double>>`
  — structurally identical to `intInverseAttempt`, but returning
  `List<List<Double>>` instead.
- `val det = (a * d - b * c).toDouble()` — the identical real
  determinant calculation, immediately converted with the real
  `toDouble()` function documented in the Header — a real `Int` becomes
  a real `Double` holding the exact same numeric value, with nothing
  lost, since every whole number is already exactly representable as a
  `Double`.
- `return listOf(listOf(d / det, -b / det), listOf(-c / det, a / det))`
  — the identical real formula, but now `/` resolves to a genuinely
  different real operator overload: `Int / Double` (via `d`, an `Int`,
  divided by `det`, now a `Double`) returns a real `Double`, computed
  with genuine fractional precision, not truncated at all — the real,
  concrete reason converting `det` alone, before any division runs,
  fixes every one of the four results at once.

### CS Lens

A numeric type unable to represent every value a real computation might
produce is a real, recurring CS idea, closely related to this project's
own already-proven floating-point-precision work: **representable
range**, here specifically the gap between "every value `Int` can hold"
and "every value this specific formula can produce." Also recognized in:
currency calculations that genuinely need fractional cents, computed
with an `Int`-only type and silently losing them; integer-only image
coordinates that can't represent a genuinely fractional zoom or pan
offset; and any real API whose documented return type turns out too
narrow for what its own real formula can actually produce, discovered
only by trying a concrete real example, exactly as this unit just did.

### SE Lens

The alternative not chosen here is forcing an inverse into `Matrix` as
it exists today anyway — rounding each result to the nearest `Int`, or
throwing whenever a result wouldn't be a whole number. Both were real
options; both were rejected for the same real reason: a "matrix inverse"
that silently rounds isn't the real mathematical inverse at all (a
rounded result generally fails the real defining property of an
inverse, `A × A⁻¹ = I`, a real, defining property this project's own
future mathematical testing work will need to check), and one that
throws on every non-whole-number result
would make `Inverse` correctly compute an answer only by coincidence,
for the rare matrix whose real inverse happens to already be all
integers — real, false advertising either way. The honest alternative,
chosen instead: `Inverse` is not built in this lesson at all. This is a
real, deliberate forward-reference, not a silently dropped feature —
`Matrix` needs a real way to hold non-integer cells before a correct
inverse can exist, and that real capability is this project's own next
real piece of unfinished business.

### Commands Needed

Already compiled in the same batched pass documented in the previous
unit. Run on its own with:

```
$ java -cp labs.jar Lab2_inverse_needs_doubleKt
```

### Run It

```
[[0, 1], [1, -2]]
[[-0.5, 1.5], [1.0, -2.0]]
```

Real, saved at `verification/8.4/lab2_inverse_needs_double.kt` and
`verification/8.4/lab2_inverse_needs_double_run.txt`.

### Connect the Pieces

The previous unit gave `add` and `multiply` a real, interchangeable
Strategy-pattern shape; this unit proves that exact same shape isn't yet
enough to add `Inverse` alongside them — not because the Strategy
pattern itself is wrong for it, but because `Matrix`'s own current,
`Int`-only cells genuinely cannot hold a correct answer.

## Closing

### Connect the Pieces

One concrete pair of matrices, traced through both units built in this
lesson: `Matrix(listOf(listOf(1, 2), listOf(3, 4)))` and
`Matrix(listOf(listOf(10, 20), listOf(30, 40)))`, combined with
`a.add(b)`, now genuinely calls straight through to
`MatrixAddition.apply(a, b)` — the identical real result as before this
lesson, `[[11, 22], [33, 44]]`, but reached through a real, named,
independently-callable object instead of code sealed inside `Matrix`
itself; the same real pair, combined with `a.multiply(b)`, now calls
`MatrixMultiplication.apply(a, b)` the same way. A third, real,
concrete matrix, `[[4, 3], [2, 1]]`, was carried through this lesson's
own second unit instead: its real determinant, `-2`, computed exactly as
`Matrix.determinant()` already does — and dividing by that real `-2`
using bare `Int` division silently produced a wrong answer,
`[[0, 1], [1, -2]]`, while converting to `Double` first produced the
real, correct one, `[[-0.5, 1.5], [1.0, -2.0]]` — real, decisive proof
that `Inverse` has a genuine, structural reason to wait, not a
convenient excuse. `Matrix.kt` now holds a real `MatrixOperation`
interface with two real implementations, `add`/`multiply` refactored to
use them, and one honestly, explicitly open real promise. This project
still has 69 real, passing tests — 66 carried over unchanged, plus three
new ones in `MatrixOperationTest.kt` proving `MatrixAddition` and
`MatrixMultiplication` both work correctly on their own and can be
chosen polymorphically through the shared `MatrixOperation` interface.
Real, verified via a full `./gradlew testDebugUnitTest assembleDebug`
run.

**Next:** Lesson 8.5 asks whether `Matrix`'s own real construction —
building a plain matrix, and, soon, special ones like an identity
matrix — genuinely benefits from a Factory pattern, or whether a plain
constructor already does the job.
