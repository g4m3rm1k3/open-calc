# Lesson 8.2: The Grid That Checks Itself

*Matrix API*

- **What you will build.** This project's own first real, permanent
  Matrix type — a new file, `Matrix.kt`, wrapping the nested-collection
  shape proven real in this lesson's own predecessor, but this time
  actually enforcing the one property that shape never enforced on its
  own: every row must have the same length. On top of that validated
  shape, five real, working matrix operations land: `add`, `subtract`,
  `multiply`, `transpose`, and `determinant` — each one a genuinely
  different transferable problem (element-wise combination under a
  shared-dimension rule; a fundamentally different, non-element-wise
  combination rule for multiplication; reshaping a single matrix instead
  of combining two; and a domain-restricted scalar reduction), not five
  copies of the same idea.
- **What you need to know first.** This lesson's own direct predecessor —
  `List<List<Int>>` as a nested-collection grid, chained `List<E>.get`
  indexing, and the real, proven fact that nothing about that shape
  enforces equal row lengths; Lesson 0.8's `data class`; Lesson 0.9's
  `map`; Lesson 2.5's `try`-as-expression and real, thrown exceptions.

## Terms used in this lesson

- **Operator function** — an ordinary function given one of a small,
  fixed set of special names (`get`, `plus`, `times`, and others) and
  marked with the `operator` keyword, which lets Kotlin call it using
  built-in syntax instead of its literal dotted name. This exists so
  code working with a collection, or with a type this project defines
  itself, can read the way the math or notation it's modeling already
  reads. This lesson's own new use of it — a `get` taking *two*
  parameters at once, called as `matrix[row, col]` — is still this exact
  same mechanism; nothing about `operator` itself changes for a
  multi-parameter version.
- **`init` block** — a special block inside a class body, distinct from
  any of its functions, that runs exactly once, automatically, as part
  of constructing every instance — after the primary constructor's
  parameters are bound, before the constructor call returns to whoever
  requested the new instance. This exists because some checks (is this
  data actually valid?) need to run once, at the moment of creation,
  rather than being left to every piece of code that might later touch
  the object to remember to check for itself.
- **`data class`** — a class whose primary-constructor properties get
  real, compiler-generated `equals`, `hashCode`, `toString`, and `copy`
  implementations, based on comparing or combining exactly those
  properties, without the class's own author writing any of the four by
  hand. This exists because structural equality (two instances holding
  the same data should be considered equal) and safe, informative
  printing are needed constantly, and writing correct, consistent
  versions of all four by hand, for every class, is exactly the kind of
  repetitive, error-prone work a compiler can do more reliably.
- **Dot product** — a real linear-algebra operation: given two
  equal-length lists of numbers, multiply each pair of numbers at the
  same position together, then add up all of those products into one
  single number. This exists as its own named idea because it is exactly
  the one calculation matrix multiplication repeats, over and over, once
  per cell of its result — understanding it in isolation, once, makes
  the larger operation nothing more than "do this same small thing many
  times."
- **Square matrix** — a matrix whose row count and column count are
  equal. This term exists because several real matrix operations —
  determinant among them — are only mathematically defined when this
  condition holds; a matrix that isn't square has no determinant at all,
  not merely an inconvenient one to compute.
- **Determinant** — a single real number computed from a square matrix,
  encoding (among other things) whether that matrix can be "undone" by
  another matrix at all. This term names the linear-algebra *concept*;
  the method this lesson adds to compute it, `determinant()`, is
  documented separately, below.
- **Transpose** — the linear-algebra operation of turning a matrix's rows
  into its columns and its columns into its rows, producing a new matrix
  whose dimensions are the original's own dimensions reversed. This term
  names the concept; the method this lesson adds to perform it,
  `transpose()`, is documented separately, below.

## Objects and methods used

- **`Matrix`**
  - *What it is:* this project's own new, permanent, from-scratch class —
    this entire lesson's real subject — wrapping a nested `List<List<Int>>`
    grid and guaranteeing, for every instance that exists at all, that
    every row it holds really does have the same length.
  - *Implementation:* `data class Matrix(private val data: List<List<Int>>)`,
    with two more real, computed properties declared in its body,
    `val rows: Int` and `val cols: Int`, plus a real `init` block; see
    the first Concept Unit, below, for its full body as this lesson
    builds it.
  - *Its use:* every operation this lesson adds — `get`, `add`,
    `subtract`, `multiply`, `transpose`, `determinant` — is a real method
    defined directly on this class; nothing in this lesson exists apart
    from it.
  - *Type:* a `data class` — a real, concrete, instantiable class, not an
    interface.
  - *Responsibility:* to be the one and only way this project ever
    represents a matrix, guaranteeing every instance that successfully
    gets constructed is genuinely rectangular, and to own every
    operation a matrix can validly perform on itself or another `Matrix`.
  - *Depends on:* a real `List<List<Int>>` handed to its constructor;
    nothing else — no Android or Compose import, matching this project's
    own already-established, already-proven pattern of keeping domain
    logic like `Calculator.kt` free of any framework dependency.
  - *Connects to:* constructed directly by this lesson's own lab and test
    code (a real, permanent, tested class, not yet wired to any real
    on-screen keypad — that wiring is explicitly not this lesson's own
    job); its own methods call each other's shared helpers (`get`, used
    internally by `add`/`subtract`/`multiply`/`transpose`/`determinant`
    alike) and the real stdlib functions documented below (`require`,
    `until`, `map`, `sumOf`).
  - *Shape:* a public, permanent domain type — this project's own
    equivalent, for two-dimensional data, of what `CalculatorState`
    already is for the calculator's own single-value display.
- **`require`**
  - *What it is:* a real, top-level Kotlin standard-library function that
    checks a condition and throws a real exception immediately if that
    condition is false.
  - *Implementation:* `public inline fun require(value: Boolean, lazyMessage: () -> Any): Unit`,
    confirmed from the real, current source in
    `kotlin-stdlib-sources.jar`; when `value` is `false`, it throws a
    real `IllegalArgumentException`, built from whatever `lazyMessage`
    returns, converted to a `String`.
  - *Its use:* this is the exact function `Matrix`'s own `init` block, and
    four of its five new operations, use to refuse to proceed the moment
    their own real precondition (matching row lengths; matching
    dimensions between two matrices; a square matrix for `determinant`)
    isn't met.
  - *Type:* a top-level, inline function.
  - *Responsibility:* to be one single, consistent way of stating "this
    must be true for what comes next to make sense" and failing loudly,
    immediately, with a real, specific message, the instant it isn't —
    never silently continuing with bad data.
  - *Depends on:* the `Boolean` condition to check; a `lazyMessage`
    function supplying the real exception's message, only actually
    called (hence "lazy") when the condition is already false, so
    building the message string costs nothing on the normal, valid path.
  - *Connects to:* called by `Matrix`'s own `init` block and by
    `add`/`subtract`/`multiply`/`determinant`; when it fires, it throws
    outward to whichever caller invoked the failing operation — never
    caught inside `Matrix` itself.
  - *Shape:* a public stdlib API surface — the standard, idiomatic
    Kotlin tool for precondition-checking, used here as this project's
    own real fail-fast mechanism.
- **`all`**
  - *What it is:* a real Kotlin standard-library function checking
    whether every element of a collection satisfies a given condition.
  - *Implementation:* `public inline fun <T> Iterable<T>.all(predicate: (T) -> Boolean): Boolean`,
    confirmed from the real, current source in
    `kotlin-stdlib-sources.jar` — a generic extension function.
  - *Its use:* `Matrix`'s own `init` block calls this on `data` — the
    outer list of rows — to check, in one expression, whether every
    single row's own length matches the expected column count, which is
    exactly what "this grid is genuinely rectangular" means.
  - *Type:* a generic, inline extension function on `Iterable<T>`.
  - *Responsibility:* to return `true` only if `predicate` returns `true`
    for every element, stopping and returning `false` the moment any one
    element fails it, without checking the rest.
  - *Depends on:* the receiver collection, and a `predicate` function
    stating the condition each element must satisfy.
  - *Connects to:* called directly by `Matrix`'s own `init` block, on
    `data`; its own `predicate` lambda reads each row's `size`, the same
    real `List.size` already documented in this lesson's own
    predecessor.
  - *Shape:* a public stdlib API surface — the direct, idiomatic Kotlin
    way to state "this must be true of every element," reached for here
    instead of a hand-written loop with an early `return false`.
- **`get` (two-parameter operator, on `Matrix`)**
  - *What it is:* this lesson's own new method, defined on `Matrix`
    itself, letting real code write `matrix[row, col]` to reach one
    specific cell.
  - *Implementation:* `operator fun get(row: Int, col: Int): Int = data[row][col]`
    — a real method this lesson's own code writes, not something
    inherited from `List`.
  - *Its use:* every one of `Matrix`'s own five new operations reads
    individual cells through this exact method, via `this[r, c]`, rather
    than reaching into the private `data` field directly.
  - *Type:* an instance method on `Matrix`, marked `operator` so `[]`
    syntax with two comma-separated arguments can call it.
  - *Responsibility:* given one row position and one column position,
    return the single `Int` stored at that exact cell — nothing about
    bounds-checking beyond whatever the underlying `List<List<Int>>`'s
    own chained `get` calls already do.
  - *Depends on:* a real `Matrix` instance with real backing `data`; a
    `row` and a `col`, each expected to be a valid position for this
    specific instance.
  - *Connects to:* called by every other method this lesson adds to
    `Matrix`; internally calls straight through to `data[row][col]` —
    two chained calls to `List<E>`'s own single-parameter `get`, the
    exact mechanism this lesson's own predecessor already proved.
  - *Shape:* a public, per-cell read API — this project's own
    domain-specific version of the same "which one" role
    `List<E>.get` already plays for a flat list.
- **`until`**
  - *What it is:* a real, infix Kotlin standard-library function that
    builds a range of consecutive integers.
  - *Implementation:* `public infix fun Int.until(to: Int): IntRange`,
    confirmed from the real, current source in
    `kotlin-stdlib-sources.jar` — an *infix* function, meaning
    `0 until rows` is real Kotlin syntax for the ordinary call
    `0.until(rows)`, just written without the dot and parentheses.
    Returns a real `IntRange`, a concrete type representing every whole
    number from its start up to, but not including, its end.
  - *Its use:* every one of `Matrix`'s new operations needs to visit
    every row and every column position — `0 until rows` and
    `0 until cols` are how this lesson's code names "every valid row
    index" and "every valid column index" without hard-coding either
    count.
  - *Type:* an infix extension function on `Int`.
  - *Responsibility:* to produce one real, iterable `IntRange` value
    representing exactly the integers `0, 1, 2, ..., to - 1` — nothing
    about iterating them itself; that's `map`'s job, below.
  - *Depends on:* the `Int` receiver it's called on (the range's start)
    and the `to` argument (its exclusive end).
  - *Connects to:* called directly by this lesson's own code
    (`0 until rows`, `0 until cols`, `0 until other.cols`); its result is
    immediately handed to `map`, which is the only thing this lesson's
    code ever does with the range it returns.
  - *Shape:* a public stdlib API surface — the standard, idiomatic way to
    say "every index from zero up to (not including) this count" in
    Kotlin, reached for instead of a hand-written counting loop.
- **`map`**
  - *What it is:* a real Kotlin standard-library function that builds a
    new list by applying a given transformation to every element of an
    existing collection, in order.
  - *Implementation:* `public inline fun <T, R> Iterable<T>.map(transform: (T) -> R): List<R>`
    — a generic extension function; `IntRange` (this lesson's own
    receiver, via `until`) is one real, concrete kind of `Iterable<Int>`,
    so this exact same `map` works on it without any special-casing.
  - *Its use:* every one of `Matrix`'s new operations uses `map`, applied
    to a range from `until`, to build one row (or, nested, one whole
    grid of rows) of real output values — never a hand-written loop with
    a mutable accumulator list.
  - *Type:* a generic, inline extension function on `Iterable<T>`.
  - *Responsibility:* to produce exactly one new output element for every
    input element, in the same order, with no element skipped, added, or
    reordered.
  - *Depends on:* the receiver collection being mapped, and a `transform`
    function describing what to do with each individual element.
  - *Connects to:* called on the `IntRange` `until` returns; the
    `transform` lambda passed to it, in this lesson's own code, itself
    calls `get` (via `this[r, c]` or similar) and, for `multiply`,
    `sumOf` — nesting one `map` inside another is exactly how this
    lesson's code builds a full 2D result from two 1D ranges.
  - *Shape:* a public, foundational stdlib API surface — this project's
    own established, reappearing way (first proven real back when lists
    were introduced) to turn "a range of positions" into "a real list of
    real values."
- **`sumOf`**
  - *What it is:* a real Kotlin standard-library function that adds up a
    number computed from every element of a collection into one single
    total.
  - *Implementation:* `public inline fun <T> Iterable<T>.sumOf(selector: (T) -> Int): Int`,
    confirmed from the real, current source in
    `kotlin-stdlib-sources.jar` — a generic extension function with a
    real overload specifically for `Int`-producing selectors, distinct
    from the overloads that sum `Double`, `Long`, and other numeric
    types.
  - *Its use:* this is exactly the dot-product calculation `multiply`
    needs — for one output cell, multiply each paired element from a row
    and a column, then add every one of those products together into
    that cell's single real value.
  - *Type:* a generic, inline extension function on `Iterable<T>`.
  - *Responsibility:* to compute one running total by calling `selector`
    once per element and adding each result, starting from zero — never
    building an intermediate list of the individual products the way
    `map` followed by a separate sum would.
  - *Depends on:* the receiver collection, and a `selector` function
    naming what `Int` value each element contributes to the total.
  - *Connects to:* called, in this lesson's own `multiply`, on a range
    from `until`; its own `selector` lambda calls `get` twice per call,
    once on each of the two matrices being multiplied.
  - *Shape:* a public stdlib API surface — the direct, idiomatic Kotlin
    tool for "one number, accumulated across a collection," reached for
    here instead of a hand-written mutable running-total variable.
- **`add`, `subtract`, `multiply`, `transpose`, `determinant` (on `Matrix`)**
  - *What it is:* this lesson's own five new, real, permanent methods —
    this entire lesson's own actual feature, the reason this lesson
    exists.
  - *Implementation:* `fun add(other: Matrix): Matrix`,
    `fun subtract(other: Matrix): Matrix`,
    `fun multiply(other: Matrix): Matrix`, `fun transpose(): Matrix`, and
    `fun determinant(): Int` — five distinct real signatures, shown and
    explained in full, one per Concept Unit, below.
  - *Its use:* together, these are this project's own real answer to the
    BRD's own Slice 8 feature — real matrix creation and operations —
    the actual reason `Matrix` was worth building at all.
  - *Type:* five separate instance methods on `Matrix`.
  - *Responsibility:* `add`/`subtract` each combine two same-shaped
    matrices, cell by corresponding cell; `multiply` combines two
    matrices whose shapes satisfy a different, real rule (the first's
    column count must equal the second's row count), producing a result
    whose own shape can genuinely differ from either input's; `transpose`
    reshapes one matrix into a new one with its rows and columns
    swapped; `determinant` reduces one square matrix down to a single
    real number.
  - *Depends on:* `add`/`subtract`/`multiply` each depend on a second,
    real `other: Matrix` argument; `transpose`/`determinant` need only
    the receiver `Matrix` itself. All five depend on `get`, `until`,
    `map`, and `require` already documented above.
  - *Connects to:* called directly by this lesson's own lab and test
    code; each of the four that return a `Matrix` (`add`, `subtract`,
    `multiply`, `transpose`) constructs a brand-new `Matrix` instance
    from freshly-computed data, rather than mutating the receiver or
    either argument — no existing `Matrix` instance is ever changed by
    any of this lesson's own new code.
  - *Shape:* a public API surface — the actual, real feature this
    project's own Matrix Calculator mode (not yet wired to any screen)
    will eventually be built on top of.

**Everything else in the file, not this lesson's subject but still explained.**

- **`IllegalArgumentException`**
  - *What it is:* a real, standard Java exception class, part of the JVM
    `java.lang` package Kotlin runs on top of, representing a method
    having been called with an argument (or, here, in a state) that
    doesn't satisfy what it needs to do its job.
  - *Implementation:* a real, public class with a constructor accepting
    a `String` message, exposed afterward through its own real
    `.message` property — this is exactly the type `require` throws,
    confirmed above.
  - *Its use:* every real precondition failure this lesson's code can
    produce — a jagged constructor argument, mismatched dimensions, a
    non-square matrix handed to `determinant` — surfaces as this exact,
    real exception type, letting this lesson's own tests check for it
    specifically rather than any exception at all.
  - *Type:* a concrete class, part of the real Java standard library, not
    Kotlin's own.
  - *Responsibility:* to represent, specifically, "an argument or an
    object's own state was invalid" — a narrower, more specific claim
    than a bare `Exception`, letting code that catches it know
    concretely what kind of problem it's handling.
  - *Depends on:* a `String` message describing, specifically, what was
    invalid — supplied by `require`'s own `lazyMessage` whenever it
    actually fires.
  - *Connects to:* thrown by `require`; caught, in this lesson's own real
    tests, by `assertThrows`, documented next.
  - *Shape:* a public, foundational JVM class — the real, standard type
    Kotlin's own `require` function is built on top of, not anything
    Kotlin invented itself.
- **`assertEquals`**
  - *What it is:* a real static method from JUnit, this project's own
    already-established testing library, asserting that two values are
    equal.
  - *Implementation:* `public static void assertEquals(Object expected, Object actual)`,
    a real overload of `org.junit.Assert.assertEquals` — this lesson's
    own tests call it with two `Matrix` instances, which resolves to
    exactly this `Object, Object` overload since `Matrix` is a real
    class, not a primitive.
  - *Its use:* every one of this lesson's real tests that checks an
    operation's *result* (not just that it throws) calls this,
    comparing an expected `Matrix`, built by hand, against the real
    `Matrix` the operation under test actually produced.
  - *Type:* a `static` method — no `Matrix` or `Assert` instance is ever
    created to call it.
  - *Responsibility:* to compare two values for equality and, if they
    aren't equal, fail the test with a real, readable message showing
    both.
  - *Depends on:* the expected and actual values; for two `Matrix`
    instances specifically, it depends on `Matrix` being a `data class`
    — without the real, compiler-generated `equals` that produces, two
    separately-built `Matrix` instances holding identical data would
    compare unequal by raw object identity instead, and every one of
    this lesson's own result-checking tests would fail for the wrong
    reason.
  - *Connects to:* called directly by this lesson's own test code; reads
    `Matrix`'s own generated `equals` method to decide its answer.
  - *Shape:* a public testing-library API surface — this project's own
    already-established way of stating "this is what the real result
    should be."
- **`assertThrows`**
  - *What it is:* a real static method from JUnit asserting that running
    a given block of code actually throws a specific exception type.
  - *Implementation:* `public static <T extends Throwable> T assertThrows(Class<T> expectedThrowable, Executable runnable)`
    — a real, generic static method already used by this project's own
    earlier tests.
  - *Its use:* every one of this lesson's real tests checking a
    *rejected* precondition — a jagged constructor call, mismatched
    dimensions on `add`/`multiply`, a non-square `determinant` — calls
    this, rather than `assertEquals`, since there's no successful result
    value to compare in these cases at all.
  - *Type:* a generic `static` method.
  - *Responsibility:* to run the block of code it's given and fail the
    test if that block either doesn't throw at all, or throws something
    other than the specific exception type named.
  - *Depends on:* the expected exception type
    (`IllegalArgumentException::class.java`, in every one of this
    lesson's own uses) and a block of code to run.
  - *Connects to:* called directly by this lesson's own test code; the
    block of code it runs calls straight into whichever `Matrix`
    constructor or method is actually under test, which in turn calls
    `require`.
  - *Shape:* a public testing-library API surface — this project's own
    already-established way of proving a real failure path actually
    fails, not just that the success path succeeds.

Every real signature and body quoted above was fetched and confirmed
from the genuine, currently-installed `kotlin-stdlib-sources.jar` this
session, not written from memory. A reader wanting to confirm any of
them independently has two ordinary paths: Kotlin's own official public
API documentation at `kotlinlang.org`, or an IDE's go-to-definition,
which opens this exact same stdlib source directly.

## Concept Unit: The Matrix Class

### The Problem

This lesson's own predecessor proved something uncomfortable: a
`List<List<Int>>` with rows of different lengths — `[1, 2, 3]` next to
`[4, 5]` — compiles and runs exactly as cleanly as a genuine, well-formed
matrix. Nothing about that bare shape stops a caller from building
something that was never actually a valid matrix at all. Before any real
matrix arithmetic can be trusted, there has to be one real, specific
place where that check actually happens — and it has to happen exactly
once, at the moment a matrix is built, not re-checked by every single
operation that might ever touch it afterward.

> This project already has a real, working pattern for "check something
> and fail loudly the instant it's wrong": this calculator's own
> division-by-zero fix caught a real exception after the fact, once it
> had already happened. Here, the problem is different — the goal is
> refusing to
> let the bad data get created in the first place. Given that a class's
> own constructor already runs exactly once per instance, what would you
> try writing, inside the class itself, to make an invalid matrix
> literally impossible to construct? Is there a place inside a class
> body that's guaranteed to run automatically, every time, before the
> new instance is ever handed back to whoever asked for it?

### Introduce the Concept in Isolation

```kotlin
class LabPositiveNumber(val value: Int) {
    init {
        require(value > 0) { "value must be positive, was $value" }
    }
}

fun main() {
    val ok = LabPositiveNumber(5)
    println(ok.value)
    try {
        LabPositiveNumber(-3)
    } catch (invalid: IllegalArgumentException) {
        println(invalid.message)
    }
}
```

Run for real, batch-compiled with this lesson's other five labs via a
single `kotlinc` pass (see Commands Needed, below):

```
5
value must be positive, was -3
```

This real, executed output proves both halves of the mechanism at once:
constructing `LabPositiveNumber(5)` succeeds silently — the `init`
block's own `require` check passes, so nothing interrupts the
constructor, and `ok.value` reads back the real `5` just handed to it.
Constructing `LabPositiveNumber(-3)`, by contrast, never produces a
usable instance at all — the `init` block runs automatically, its
`require` check fails, and a real, thrown `IllegalArgumentException`
propagates out of the constructor itself, caught here only so its real
message (`"value must be positive, was -3"`) can be printed instead of
crashing the whole program. This automatic, once-per-construction check
is called an **`init` block**, and `require` is the real function this
lesson uses inside it.

### Discard the Throwaway Example

This exact `LabPositiveNumber` class is discarded now and will not
appear again — but the real pattern it just proved (an `init` block
calling `require` to reject bad data before construction ever succeeds)
is exactly what `Matrix` itself needs, for real, right now.

### Project Change

- **Reference Source** — no reference counterpart; this is a
  from-scratch addition. Nothing in this project's own BRD names a
  specific existing implementation to port `Matrix` from — this lesson's
  own predecessor's throwaway labs proved the *problem* real, but
  deliberately built no permanent type at all.
- **Files affected** — a brand-new file,
  `app/src/main/java/com/example/calculator/Matrix.kt`.
- **Change type** — add (new file).
- **Location** — none yet; this is the file's very first content.
- **Dependencies** — none beyond the Kotlin standard library already
  available to every file in this project; no Android or Compose import,
  matching this project's own already-proven, deliberate pattern of
  keeping domain logic free of any framework dependency (already proven
  true, this same way, for `Calculator.kt` itself).

### The New Code

```kotlin
data class Matrix(private val data: List<List<Int>>) {
    val rows: Int = data.size
    val cols: Int = if (data.isEmpty()) 0 else data[0].size

    init {
        require(data.all { it.size == cols }) {
            "All rows must have the same number of columns"
        }
    }
}
```

### The Updated Project

This is the entirety of `Matrix.kt`'s own first real content — a
brand-new file with nothing surrounding it yet, so there is no larger
enclosing structure to return to; the block just shown *is* the whole
new structure. As it stands right now, `Matrix` is a real, constructible
type: given a `List<List<Int>>`, it computes and exposes its own real
`rows` and `cols` counts, and it refuses, for real, to finish
constructing at all if the data handed to it isn't genuinely
rectangular.

### Mechanical Walkthrough

Every distinct element of the New Code above, in the order it appears:

- `data class Matrix(private val data: List<List<Int>>)` — a class
  declaration. `data class` marks this class for real,
  compiler-generated `equals`, `hashCode`, `toString`, and `copy`
  implementations, based on its primary-constructor properties — here,
  just `data` — without this lesson's own code writing any of the four
  by hand; this matters concretely later in this lesson, the moment a
  test needs to check whether two separately-built `Matrix` instances
  hold the same values. `private val data: List<List<Int>>` is the
  primary constructor's own single parameter, also declared as a real
  property (via `val`) on the class, and marked `private` so no code
  outside `Matrix` itself can read or reassign the raw underlying grid
  directly — every real interaction with a `Matrix`'s own contents has
  to go through a method `Matrix` itself defines, starting with `get`,
  in the next unit.
- `val rows: Int = data.size` — a second, real property, computed once,
  directly from the constructor parameter `data` still in scope during
  initialization. `data.size` is the same real `List.size` property
  documented in this lesson's own predecessor, read here on the outer
  list — the row count.
- `val cols: Int = if (data.isEmpty()) 0 else data[0].size` — a third
  property, using `if`/`else` as a real Kotlin *expression* (a pattern
  this project's own division-by-zero fix already proved: an `if` whose
  result is directly used, not just a branch of code to run). When
  `data` is empty, `cols` is defined as `0` rather than attempting
  `data[0].size` — reading index `0` of an empty list would itself throw
  a real `IndexOutOfBoundsException`, so this check exists specifically
  to avoid that. When `data` isn't empty, `cols` reads the first row's
  own `size`, the same real `List.size` property, read here on one
  specific inner row instead of the outer list.
- `init { ... }` — the `init` block just proven real and named, above:
  automatic, runs once, during construction, before the new `Matrix`
  instance is ever handed back to whoever called `Matrix(...)`.
- `require(data.all { it.size == cols }) { ... }` — the same real
  `require` function documented in the Header, called here with a real,
  computed condition rather than a simple comparison. `data.all { it.size == cols }`
  is a call to `all`, a real Kotlin standard-library function (new to
  this project) that returns `true` only if its lambda returns `true`
  for *every* element of the receiver collection, `false` the moment any
  one element fails it; `it` refers to each individual row in turn (the
  implicit single-parameter name Kotlin allows when a lambda takes
  exactly one argument), and `it.size == cols` asks, for each row,
  whether that row's own length matches the `cols` value just computed
  above from the first row. If every row agrees, `require`'s condition
  is `true` and construction proceeds silently; if even one row
  disagrees, `require`'s condition is `false`, and it throws — this is
  the exact real check that closes the gap this lesson's own predecessor
  proved was open.
- `{ "All rows must have the same number of columns" }` — the trailing
  lambda `require` uses as its own lazy message, called by `require`
  itself only if the condition just described turns out to be `false`.

### CS Lens

Checking a real invariant once, at the moment an object is created,
rather than trusting every future caller to maintain it, is a real,
recurring CS/SE idea: **constructor validation**, a specific application
of the broader **fail-fast** principle. Also recognized in: database
systems enforcing `NOT NULL`/`CHECK` constraints at the moment a row is
inserted, not whenever it's later read; strongly-typed language
compilers rejecting a program at compile time rather than letting a type
error surface as a runtime crash; and factory functions in many
languages that deliberately return `null` or a `Result`-style wrapper
instead of a real object at all, when the data handed to them wasn't
valid to begin with.

### SE Lens

The alternative not chosen here is deferring the check — letting
`Matrix` accept any `List<List<Int>>` at all, and only validating
dimensions later, inside each individual operation (`add`, `multiply`,
and so on) right before it actually needs them to match. That approach
was considered, in exactly the form this lesson's own predecessor's own
SE Lens already previewed, and rejected for a real, concrete reason:
under that design, a genuinely broken `Matrix` — one built from a jagged
list — could exist, get passed around this project's own code, get
stored, get displayed, for an arbitrary amount of time before anything
ever actually tried an operation that would expose the problem; the
failure, when it finally happened, would point at whichever operation
happened to be unlucky enough to touch it first, not at the real,
original moment the bad data was created. Validating once, in `init`,
means an invalid `Matrix` simply cannot exist anywhere in this project's
memory, ever, even for a moment — the real cost, honestly stated: every
one of `Matrix`'s five new operations, below, can now assume its own
`Matrix` inputs are already well-formed, and none of them re-checks
rectangularity itself.

### Commands Needed

All six of this lesson's labs were compiled together in one real,
batched pass:

```
$ kotlinc lab1_init_require.kt lab2_two_param_get.kt lab3_elementwise_binary_op.kt lab4_dot_product.kt lab5_transpose.kt lab6_determinant_2x2.kt -include-runtime -d labs.jar
```

Each file's own top-level `fun main()` produces its own independently
runnable class, `Lab1_init_requireKt` here. This specific lab was then
run with:

```
$ java -cp labs.jar Lab1_init_requireKt
```

Separately, this unit's real project change was verified against the
real, complete Gradle project — the same real command this project has
used since its very first Android build:

```
$ ./gradlew :app:compileDebugKotlin
```

### Run It

```
5
value must be positive, was -3
```

Real, saved at `verification/8.2/lab1_init_require.kt` and
`verification/8.2/lab1_init_require_run.txt`. `Matrix.kt`'s own real
compile against the full Gradle project succeeded — real, confirmed via
a full `./gradlew testDebugUnitTest assembleDebug` run at the end of
this lesson (see the Closing, below), covering every unit's own project
change together.

### Connect the Pieces

This unit closes the exact gap this lesson's own predecessor spent its
entire third unit proving was real: `Matrix` now exists, for real, and
nothing broken can be built with it — the next unit gives real code a
way to actually read a value back out of one.

## Concept Unit: Two-Parameter Indexing

### The Problem

`Matrix` now keeps its own `data` `private` — no code outside `Matrix`
itself can reach in and read `data[row][col]` directly anymore, on
purpose, per the previous unit's own SE Lens. But a matrix nobody can
read a single value out of isn't useful for anything yet. This lesson's
own predecessor already proved `grid[row][col]` — two chained,
single-parameter `get` calls — works on a bare `List<List<Int>>`. The
real question this unit answers: is chained double-bracket indexing the
only real option once the grid is wrapped inside `Matrix`'s own class,
or does Kotlin's `operator` mechanism support something else?

> `operator fun get(index: Int): E`, from this lesson's own predecessor,
> takes exactly one parameter. Nothing about the `operator` keyword
> itself limits a function to one parameter, though — an `operator fun`
> is still an ordinary function underneath, and ordinary functions can
> take more than one argument. Given that, what do you think
> `matrix[1, 2]` — one set of brackets, two comma-separated values
> inside it — would actually call, if `Matrix` declared a `get` taking
> two `Int` parameters instead of one? Would you expect Kotlin to allow
> that at all?

### Introduce the Concept in Isolation

```kotlin
class LabGrid(private val data: List<List<Int>>) {
    operator fun get(row: Int, col: Int): Int = data[row][col]
}

fun main() {
    val g = LabGrid(listOf(listOf(1, 2, 3), listOf(4, 5, 6)))
    println(g[1, 2])
}
```

Run for real, from this lesson's own batched compile:

```
6
```

This real, executed output proves Kotlin's `operator` mechanism really
does support more than one parameter: `g[1, 2]` — a single set of
brackets holding two comma-separated `Int`s — compiles and runs, calling
`LabGrid`'s own two-parameter `get` directly, reaching the same real
cell (`6`, row 1, column 2) this lesson's own predecessor reached with
`grid[1][2]`'s two separate, chained single-parameter calls. This is a
**two-parameter operator function** — still the exact same `operator`
mechanism already proven real, just declared with two parameters instead
of one.

### Discard the Throwaway Example

This exact `LabGrid` class is discarded now — but the real proof that
`operator fun get` genuinely supports more than one parameter is exactly
what `Matrix`'s own real `get` needs.

### Project Change

- **Reference Source** — no reference counterpart; a from-scratch
  addition, same as the previous unit.
- **Files affected** —
  `app/src/main/java/com/example/calculator/Matrix.kt`.
- **Change type** — add (a new method inside the existing class).
- **Location** — inside `Matrix`, directly after the `init` block added
  in the previous unit.
- **Dependencies** — the previous unit's own `Matrix` class and its
  private `data` property.

### The New Code

```kotlin
operator fun get(row: Int, col: Int): Int = data[row][col]
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
11:    operator fun get(row: Int, col: Int): Int = data[row][col] // ← new
12: }
```

`Matrix` now does two real things instead of one: it still refuses, at
construction, to exist at all in a jagged, invalid shape, and it now
also gives real, outside code exactly one safe way to read a single cell
back out of that guaranteed-valid shape — never touching the `private`
`data` field directly.

### Mechanical Walkthrough

- `operator fun get(row: Int, col: Int): Int` — a two-parameter method
  declaration, marked `operator`, on `Matrix`. This is the exact same
  `operator` mechanism this lesson's own predecessor already proved for
  a single-parameter `get`; the only real difference is the parameter
  list itself, `(row: Int, col: Int)` instead of `(index: Int)` — two
  named `Int` parameters instead of one, which is what makes
  `matrix[someRow, someCol]`, with a comma inside the brackets, valid
  Kotlin at all.
- `= data[row][col]` — the method's own single-expression body (an
  ordinary Kotlin shorthand for a function whose entire body is one
  expression, already established since this project's very first
  functions), reading `data`, the `private` constructor property from
  the previous unit, with the same two chained, single-parameter `get`
  calls this lesson's own predecessor already fully proved — `data[row]`
  returns one row (a `List<Int>`), and applying `[col]` to that returned
  row returns the one `Int` at that position. `Matrix`'s own new
  two-parameter `get` is not a different mechanism from chained
  indexing underneath; it's a friendlier public spelling built directly
  on top of it.

### CS Lens

Offering a cleaner, purpose-built public interface (`matrix[row, col]`)
on top of an already-working, more mechanical internal one (chained
`data[row][col]`) is a real, recurring CS/SE idea: **encapsulation** —
hiding a type's own internal representation behind a smaller, more
meaningful set of operations. Also recognized in: a `Stack`'s own
`push`/`pop` methods hiding whatever array or linked structure actually
holds its elements underneath (a real idea this project's own Stage 5
already used); a database's public query interface hiding its actual
on-disk storage format; and any class exposing named getter methods
instead of public fields, so the class's own author stays free to change
the internal representation later without breaking anyone calling
those methods.

### SE Lens

The alternative not chosen here is simply leaving `data` accessible
(dropping the `private` modifier) and letting every caller write
`matrix.data[row][col]` themselves, or requiring chained
`matrix[row][col]`-style indexing the way a bare `List<List<Int>>`
already supports, with no dedicated `Matrix`-level `get` at all. Both
were real options; both were rejected for the same real reason: either
one would let outside code depend directly on `Matrix` being backed by
a `List<List<Int>>` specifically, rather than depending only on "you
can ask a `Matrix` for the value at a row and a column." The real cost
of the two-parameter `get` chosen instead: it's one more method for
`Matrix`'s own author to write and maintain, doing nothing chained
indexing couldn't already do on the raw data — a small, deliberate
price for keeping `Matrix`'s own internal representation genuinely free
to change later without breaking any of this lesson's own callers.

### Commands Needed

Already compiled in the same batched pass documented in the previous
unit. Run on its own with:

```
$ java -cp labs.jar Lab2_two_param_getKt
```

This unit's real project change was verified the same way as the
previous unit's, via `./gradlew :app:compileDebugKotlin`.

### Run It

```
6
```

Real, saved at `verification/8.2/lab2_two_param_get.kt` and
`verification/8.2/lab2_two_param_get_run.txt`.

### Connect the Pieces

The previous unit made an invalid `Matrix` impossible to construct; this
unit gives real code a safe, dedicated way to read one specific value
back out of a `Matrix` that does exist. Every operation this lesson adds
from here forward — `add`, `subtract`, `multiply`, `transpose`,
`determinant` — reads its own inputs exclusively through this exact
`get` method, never through `data` directly.

## Concept Unit: Combining Two Matrices, Cell by Cell

### The Problem

`Matrix` can now be built and read from, one cell at a time — but two
separate matrices still can't be combined into anything. Real matrix
addition works cell by cell: the value at row `r`, column `c` of the
result is the sum of the values at row `r`, column `c` of each input —
and that only makes sense at all if both inputs actually have the same
number of rows and the same number of columns to begin with. Real matrix
subtraction works identically, cell by cell, with the one difference
being which arithmetic operator combines each pair. The real question:
how do you write code that visits *every* row-and-column position of a
matrix — not just one, the way `get` reaches exactly one — without
knowing in advance how many rows or columns a specific `Matrix` actually
has?

> This lesson's own `rows` and `cols` properties already report exactly
> how many row and column positions a given `Matrix` has. Given a count
> like that, what real, already-proven Kotlin tool would you reach for
> to produce "every whole number from `0` up to, but not including, that
> count" — the exact set of valid row or column positions? And once you
> have that set of positions, what would you do with each one to
> actually build a whole new row, one number at a time?

### Introduce the Concept in Isolation

```kotlin
fun labAddGrids(a: List<List<Int>>, b: List<List<Int>>): List<List<Int>> {
    require(a.size == b.size && a[0].size == b[0].size) {
        "Grids must have the same dimensions to combine"
    }
    return (0 until a.size).map { r ->
        (0 until a[0].size).map { c -> a[r][c] + b[r][c] }
    }
}

fun main() {
    val a = listOf(listOf(1, 2), listOf(3, 4))
    val b = listOf(listOf(10, 20), listOf(30, 40))
    println(labAddGrids(a, b))
    val mismatched = listOf(listOf(1, 2, 3))
    try {
        labAddGrids(a, mismatched)
    } catch (invalid: IllegalArgumentException) {
        println(invalid.message)
    }
}
```

Run for real, from this lesson's own batched compile:

```
[[11, 22], [33, 44]]
Grids must have the same dimensions to combine
```

This real, executed output proves the real mechanism: `(0 until a.size)`
produces the real range `0, 1`, and `.map { r -> ... }` applies its own
lambda once per row position, building one new row each time — and,
nested directly inside that same lambda, `(0 until a[0].size).map { c -> a[r][c] + b[r][c] }`
does the identical thing one level down, once per column position within
row `r`, producing that row's own real values. The visible result,
`[[11, 22], [33, 44]]`, is exactly `1+10`, `2+20`, `3+30`, `4+40`, each
one a real, separately-computed cell. The second, real, caught exception
proves the dimension check fires correctly the moment the two grids
genuinely disagree in shape (`2` columns versus `3`). This nested
`map`-over-`until` pattern, visiting every row-and-column position of a
grid, is what this lesson calls an **element-wise binary operation**.

### Discard the Throwaway Example

`labAddGrids` and its own free-function shape are discarded now — but
the exact nested `(0 until rows).map { r -> (0 until cols).map { c -> ... } }`
pattern it just proved is what `Matrix`'s own real `add` and `subtract`
both need, each with its own arithmetic operator swapped in.

### Project Change

- **Reference Source** — no reference counterpart; a from-scratch
  addition.
- **Files affected** —
  `app/src/main/java/com/example/calculator/Matrix.kt`.
- **Change type** — add (two new methods inside the existing class).
- **Location** — inside `Matrix`, directly after the `get` method added
  in the previous unit.
- **Dependencies** — `Matrix`'s own `rows`, `cols`, and `get`, all
  already real as of the previous two units.

### The New Code

```kotlin
fun add(other: Matrix): Matrix {
    require(rows == other.rows && cols == other.cols) {
        "Matrices must have the same dimensions to add"
    }
    return Matrix((0 until rows).map { r -> (0 until cols).map { c -> this[r, c] + other[r, c] } })
}

fun subtract(other: Matrix): Matrix {
    require(rows == other.rows && cols == other.cols) {
        "Matrices must have the same dimensions to subtract"
    }
    return Matrix((0 until rows).map { r -> (0 until cols).map { c -> this[r, c] - other[r, c] } })
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
13:    fun add(other: Matrix): Matrix { // ← new
14:        require(rows == other.rows && cols == other.cols) { // ← new
15:            "Matrices must have the same dimensions to add" // ← new
16:        } // ← new
17:        return Matrix((0 until rows).map { r -> (0 until cols).map { c -> this[r, c] + other[r, c] } }) // ← new
18:    } // ← new
19:
20:    fun subtract(other: Matrix): Matrix { // ← new
21:        require(rows == other.rows && cols == other.cols) { // ← new
22:            "Matrices must have the same dimensions to subtract" // ← new
23:        } // ← new
24:        return Matrix((0 until rows).map { r -> (0 until cols).map { c -> this[r, c] - other[r, c] } }) // ← new
25:    } // ← new
26: }
```

`Matrix` now offers its first two real operations. Both share the exact
same real shape — check dimensions with `require`, then build a whole
new `Matrix` by visiting every row-and-column position with nested
`map`-over-`until` — differing only in the one arithmetic operator
(`+` versus `-`) applied to each pair of cells.

### Mechanical Walkthrough

- `fun add(other: Matrix): Matrix` — a method declaration taking one
  parameter, another real `Matrix`, and returning a brand-new `Matrix`.
  Nothing about calling `add` changes the receiver `Matrix` or the
  `other` argument — both remain exactly as they were.
- `require(rows == other.rows && cols == other.cols) { ... }` — the same
  real `require` function already fully documented, called here with a
  compound condition: `rows == other.rows`, an equality comparison
  between the receiver's own `rows` property and the argument's; `&&`,
  real Kotlin logical AND, true only when both sides are true; and
  `cols == other.cols`, the identical comparison for column counts. Both
  must hold for two matrices to be addable at all — this is the real
  dimension check the Socratic prompt in this lesson's own predecessor's
  final unit asked the reader to imagine.
- `(0 until rows)` — the same real `until` function documented in the
  Header, called here on `Matrix`'s own `rows` property rather than a
  bare local variable, producing every real row position from `0` up to
  (not including) `rows`.
- `.map { r -> (0 until cols).map { c -> this[r, c] + other[r, c] } }`
  — the same real `map` function, called on that range. Its own lambda,
  taking one parameter named `r` (one specific row position), itself
  contains a second, nested `(0 until cols).map { c -> ... }` — the
  identical pattern, one level down, producing every column position
  `0` up to `cols` for this specific row `r`. That innermost lambda,
  `{ c -> this[r, c] + other[r, c] }`, is where the real addition
  actually happens: `this[r, c]`, the two-parameter `get` operator
  proven in the previous unit, called on the receiver `Matrix` itself
  (`this`, referring to the specific `Matrix` `add` was called on);
  `other[r, c]`, the identical call on the `other` argument; and `+`,
  ordinary `Int` addition, combining the two real values from the same
  row-and-column position of each input. The whole nested expression
  produces a real `List<List<Int>>` — a new grid, one row per outer
  `map` call, one number per inner one.
- `return Matrix(...)` — the constructor call proven real in the first
  unit of this lesson, here handed the freshly-computed
  `List<List<Int>>` just built. Because that new grid is genuinely
  rectangular by construction (both nested `map` calls always produce
  exactly `rows` rows of exactly `cols` columns each), this constructor
  call always succeeds — `add`'s own `init` block never has a real
  reason to fire.
- `fun subtract(other: Matrix): Matrix { ... }` — structurally identical
  to `add` in every respect just explained — the same `require` shape,
  the same nested `(0 until rows).map { r -> (0 until cols).map { c -> ... } }`
  pattern, the same `Matrix(...)` construction — with the one real
  difference being `this[r, c] - other[r, c]`: ordinary `Int`
  subtraction in place of addition, and the `require` block's own
  message text naming "subtract" instead of "add" for a caller who hits
  the real, thrown exception.

### CS Lens

Applying the identical operation to every corresponding pair of
positions across two same-shaped structures is a real, recurring CS
idea: **element-wise (or "pointwise") operation**. Also recognized in:
vector addition in physics and graphics engines (adding two 3D vectors
means adding their `x`, `y`, and `z` components separately); image
blending, where two images of the same dimensions get combined one
pixel at a time; and SIMD (Single Instruction, Multiple Data) hardware
instructions, which exist specifically to perform one arithmetic
operation across many data positions simultaneously, in real hardware,
for exactly this reason.

### SE Lens

The alternative not chosen here is writing `add` and `subtract` as two
entirely separate, unrelated-looking methods, each with its own
independently-written nested loop, rather than the near-identical shape
they actually share. That path was avoided by design: matching the
shape exactly, differing only in one operator, makes the *real*
difference between the two methods immediately visible to a reader
comparing them, rather than hidden inside two superficially different
implementations that happen to compute the same kind of thing. The real
cost, honestly stated: this project doesn't yet have (and, per the BRD's
own sequencing, deliberately doesn't build here) a shared abstraction —
something like the `Operation` interface `Calculator.kt` already uses
for scalar arithmetic — capturing "element-wise binary matrix operation"
once and configuring it with `+` or `-`; `add` and `subtract` remain two
separate, hand-duplicated methods for now, a real, acknowledged
duplication this project's own later Strategy Pattern lesson is the
right place to reconsider.

### Commands Needed

Already compiled in the same batched pass. Run on its own with:

```
$ java -cp labs.jar Lab3_elementwise_binary_opKt
```

This unit's real project change was verified the same way as the
previous two units', via `./gradlew :app:compileDebugKotlin`.

### Run It

```
[[11, 22], [33, 44]]
Grids must have the same dimensions to combine
```

Real, saved at `verification/8.2/lab3_elementwise_binary_op.kt` and
`verification/8.2/lab3_elementwise_binary_op_run.txt`.

### Connect the Pieces

The previous unit gave real code a way to read one cell; this unit
combines *every* cell of two same-shaped matrices into a brand-new
third one, twice over, once per real arithmetic operator. The next unit
asks whether that same nested-`map`-over-`until` shape is enough for
every real matrix operation, or whether combining two matrices a
genuinely different way needs a genuinely different rule.

## Concept Unit: Multiplication and the Dot Product

### The Problem

`add` and `subtract` both require their two matrices to already be the
exact same shape — same row count, same column count — and produce a
result of that identical shape. Real matrix multiplication follows a
completely different rule: two matrices can be multiplied whenever the
*first* one's column count matches the *second* one's row count — shapes
that don't have to match each other at all — and the result's own shape
is neither input's shape, but a new one built from the two counts that
weren't required to match. A single result cell isn't one pair of inputs
combined, either; it's a real, multi-step calculation involving one
whole row of the first matrix and one whole column of the second.

> Try this concretely: a `2×3` matrix (2 rows, 3 columns) and a `3×2`
> matrix (3 rows, 2 columns). The first's column count (`3`) matches the
> second's row count (`3`) — so, per the rule just stated, multiplying
> them should be valid. What shape would you expect the *result* to be?
> And for the result's very first cell (row `0`, column `0`) — given
> that it has to come from "one whole row of the first matrix and one
> whole column of the second" — how many individual numbers from each
> input do you think get combined to produce that single cell?

### Introduce the Concept in Isolation

```kotlin
fun labDotProduct(row: List<Int>, col: List<Int>): Int {
    return (0 until row.size).sumOf { i -> row[i] * col[i] }
}

fun main() {
    val row = listOf(1, 2, 3)
    val col = listOf(4, 5, 6)
    println(labDotProduct(row, col))
}
```

Run for real, from this lesson's own batched compile:

```
32
```

This real, executed output proves the exact calculation a single result
cell of matrix multiplication needs: `(0 until row.size)` produces the
real range `0, 1, 2` — one position per shared length between the row
and the column (both length `3` here) — and `.sumOf { i -> row[i] * col[i] }`
multiplies each same-position pair (`1×4`, `2×5`, `3×6`) and adds all
three products together in one pass: `4 + 10 + 18 = 32`. This
multiply-then-add-everything calculation, between one row's worth of
numbers and one column's worth of numbers, is called the **dot
product**, and it is the entire real content of one single result cell
of matrix multiplication — a `2×3` matrix multiplied by a `3×2` one
produces a `2×2` result because there are `2` rows to pick from the
first matrix and `2` columns to pick from the second, and every one of
those `2×2 = 4` result cells is its own separate dot product between one
of those rows and one of those columns.

### Discard the Throwaway Example

`labDotProduct` is discarded now — but the real calculation it just
proved, one dot product per result cell, is exactly what `Matrix`'s own
real `multiply` needs to compute, once per cell of its own result.

### Project Change

- **Reference Source** — no reference counterpart; a from-scratch
  addition.
- **Files affected** —
  `app/src/main/java/com/example/calculator/Matrix.kt`.
- **Change type** — add (a new method inside the existing class).
- **Location** — inside `Matrix`, directly after `subtract`, added in
  the previous unit.
- **Dependencies** — `Matrix`'s own `rows`, `cols`, and `get`.

### The New Code

```kotlin
fun multiply(other: Matrix): Matrix {
    require(cols == other.rows) {
        "Left matrix's column count must match right matrix's row count to multiply"
    }
    return Matrix((0 until rows).map { r ->
        (0 until other.cols).map { c ->
            (0 until cols).sumOf { k -> this[r, k] * other[k, c] }
        }
    })
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
13:    fun add(other: Matrix): Matrix {
14:        require(rows == other.rows && cols == other.cols) {
15:            "Matrices must have the same dimensions to add"
16:        }
17:        return Matrix((0 until rows).map { r -> (0 until cols).map { c -> this[r, c] + other[r, c] } })
18:    }
19:
20:    fun subtract(other: Matrix): Matrix {
21:        require(rows == other.rows && cols == other.cols) {
22:            "Matrices must have the same dimensions to subtract"
23:        }
24:        return Matrix((0 until rows).map { r -> (0 until cols).map { c -> this[r, c] - other[r, c] } })
25:    }
26:
27:    fun multiply(other: Matrix): Matrix { // ← new
28:        require(cols == other.rows) { // ← new
29:            "Left matrix's column count must match right matrix's row count to multiply" // ← new
30:        } // ← new
31:        return Matrix((0 until rows).map { r -> // ← new
32:            (0 until other.cols).map { c -> // ← new
33:                (0 until cols).sumOf { k -> this[r, k] * other[k, c] } // ← new
34:            } // ← new
35:        }) // ← new
36:    } // ← new
37: }
```

`Matrix` now has three real operations combining two matrices, two
sharing one exact shape (`add`/`subtract`) and one — `multiply` — with
its own, genuinely different real rule for both what's required and
what's produced.

### Mechanical Walkthrough

- `fun multiply(other: Matrix): Matrix` — a method declaration, same
  shape as `add`/`subtract`: one `Matrix` parameter, one `Matrix`
  return.
- `require(cols == other.rows) { ... }` — the same real `require`
  already documented, with a condition genuinely different from
  `add`/`subtract`'s own: `cols == other.rows`, comparing the receiver's
  own column count against the *argument's* row count — deliberately
  not `rows == other.rows` — this is the real "inner dimensions must
  match" rule multiplication follows, distinct from addition's "every
  dimension must match" rule.
- `(0 until rows)` — the same real `until` function, producing every row
  position of the receiver `Matrix` — this becomes the result's own row
  count.
- `.map { r -> (0 until other.cols).map { c -> ... } }` — the outer
  `map`, one call per row `r` of the receiver; nested inside it,
  `(0 until other.cols)`, a real, different range from the previous
  unit's own nested `map` — this one built from the *argument's* column
  count, not the receiver's — becomes the result's own column count.
  This is the concrete, executed proof that `multiply`'s result shape
  genuinely differs from either input's own shape: it takes its row
  count from the receiver and its column count from the argument.
- `(0 until cols).sumOf { k -> this[r, k] * other[k, c] }` — the
  innermost expression, computing one single result cell. `(0 until cols)`
  produces every shared position from `0` up to the receiver's own
  column count (equal, thanks to the `require` check above, to the
  argument's own row count) — the real length both the row and the
  column being combined actually share. `.sumOf { k -> this[r, k] * other[k, c] }`
  is the real dot product proven in isolation, above: for each shared
  position `k`, `this[r, k]` reads one value from the receiver's own row
  `r`, `other[k, c]` reads one value from the argument's own column `c`
  (fixing `c` while varying `k` is exactly what "reading down one whole
  column" means here, one row at a time), `*` multiplies the pair, and
  `sumOf` adds every one of those products into this cell's single real
  value.
- `return Matrix(...)` — the same real constructor call, here handed a
  grid whose own shape (`rows` rows by `other.cols` columns) can
  genuinely differ from both `this` and `other`'s own shapes — and is
  still always rectangular by construction, so `Matrix`'s own `init`
  block never has a real reason to fire here either.

### CS Lens

Computing a result matrix's dimensions from a *combination* of both
inputs' own dimensions, rather than requiring them to already match, is
still recognizably the same **dot product** idea named above, just
repeated systematically across every row-column pairing rather than
computed once in isolation. Also recognized in: 3D graphics pipelines,
where multiplying a point by a transformation matrix (rotation, scale,
translation) is real matrix multiplication happening, in real time,
every time an object moves on screen; neural networks, where a layer's
own output is computed by multiplying an input vector by a real weight
matrix; and search-and-recommendation systems, where comparing how
similar two items are is frequently computed as a real dot product
between two vectors representing them.

### SE Lens

The alternative not chosen here is writing `multiply` with the same
"require every dimension to already match" shape `add`/`subtract` use,
simply rejecting any pair of matrices whose shapes aren't identical. That
would be a real, working method — but a genuinely wrong one: it would
reject every real, legal matrix multiplication where the two shapes
differ but the inner dimensions still agree (a `2×3` times a `3×2`,
exactly this unit's own worked example), which is not an edge case in
real linear algebra, it's the ordinary case. The real cost of doing this
correctly, honestly stated: `multiply`'s own real cost, in raw work
done, is genuinely larger than `add`/`subtract`'s — three nested
loops-as-`map`-calls deep instead of two, and each one of the innermost
`sumOf` calls does `cols` real multiplications and additions on its own,
not just one. This project's own next lesson, on algorithm complexity,
is where that real cost gets named and measured precisely rather than
just gestured at here.

### Commands Needed

Already compiled in the same batched pass. Run on its own with:

```
$ java -cp labs.jar Lab4_dot_productKt
```

This unit's real project change was verified via
`./gradlew :app:compileDebugKotlin`, same as every earlier unit.

### Run It

```
32
```

Real, saved at `verification/8.2/lab4_dot_product.kt` and
`verification/8.2/lab4_dot_product_run.txt`.

### Connect the Pieces

`add` and `subtract` combine two matrices that already agree in shape,
cell by corresponding cell; `multiply`, this unit's own real addition,
combines two matrices under a genuinely different rule, producing a
genuinely different shape, one real dot product per result cell. The
next unit turns away from combining two matrices at all, toward
reshaping just one.

## Concept Unit: Transpose

### The Problem

Every real operation `Matrix` has so far takes two matrices as input
(`add`, `subtract`, `multiply`) or one and returns a single number
(nothing yet does this). Reshaping a single matrix — turning its rows
into columns and its columns into rows, with no second matrix and no
arithmetic combination involved at all — is a genuinely different kind
of operation from every one built so far. Given a `2×3` matrix (2 rows,
3 columns), what shape would the result of swapping its rows and columns
actually have, and what real value would end up at each position of
that result?

> Picture a `2×3` matrix's real cell at row `0`, column `2` — the last
> number in its first row. After swapping rows and columns, which
> position in the *new* matrix should hold that exact same number?
> Given that every result cell needs some real source cell from the
> original matrix, what relationship do you notice between a result
> position `(r, c)` and the original position it should read from? And
> given the previous unit's own real proof that a result's row and
> column counts don't have to match the input's, what row and column
> counts would you expect *this* result to have, in terms of the
> original's own `rows` and `cols`?

### Introduce the Concept in Isolation

```kotlin
fun labTranspose(grid: List<List<Int>>): List<List<Int>> {
    val rows = grid.size
    val cols = grid[0].size
    return (0 until cols).map { c ->
        (0 until rows).map { r -> grid[r][c] }
    }
}

fun main() {
    val grid = listOf(
        listOf(1, 2, 3),
        listOf(4, 5, 6)
    )
    println(labTranspose(grid))
}
```

Run for real, from this lesson's own batched compile:

```
[[1, 4], [2, 5], [3, 6]]
```

This real, executed output proves the real relationship: the original
`2×3` grid (`rows = 2`, `cols = 3`) produces a real `3×2` result — row
and column counts genuinely swapped, confirming the Socratic prompt's
own prediction. The mechanism itself is the reverse of every earlier
unit's own outer/inner `map` order: the *outer* `map` here runs over
`(0 until cols)` — the *original's* column count becomes the *result's*
own row count — and, for each `c`, the *inner* `map` runs over
`(0 until rows) { r -> grid[r][c] }`, reading straight down one whole
original *column* (fixing `c`, varying `r`) to build one whole result
*row*. The original's first row, `[1, 2, 3]`, becomes the result's first
*column* — reading down the result, `1`, `2`, `3` — proving rows really
did become columns. This reshaping operation is called **transpose**.

### Discard the Throwaway Example

`labTranspose` is discarded now — but the real outer-over-columns,
inner-over-rows pattern it just proved is exactly what `Matrix`'s own
real `transpose` needs.

### Project Change

- **Reference Source** — no reference counterpart; a from-scratch
  addition.
- **Files affected** —
  `app/src/main/java/com/example/calculator/Matrix.kt`.
- **Change type** — add (a new method inside the existing class).
- **Location** — inside `Matrix`, directly after `multiply`, added in
  the previous unit.
- **Dependencies** — `Matrix`'s own `rows`, `cols`, and `get`.

### The New Code

```kotlin
fun transpose(): Matrix {
    return Matrix((0 until cols).map { c -> (0 until rows).map { r -> this[r, c] } })
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
13:    fun add(other: Matrix): Matrix {
14:        require(rows == other.rows && cols == other.cols) {
15:            "Matrices must have the same dimensions to add"
16:        }
17:        return Matrix((0 until rows).map { r -> (0 until cols).map { c -> this[r, c] + other[r, c] } })
18:    }
19:
20:    fun subtract(other: Matrix): Matrix {
21:        require(rows == other.rows && cols == other.cols) {
22:            "Matrices must have the same dimensions to subtract"
23:        }
24:        return Matrix((0 until rows).map { r -> (0 until cols).map { c -> this[r, c] - other[r, c] } })
25:    }
26:
27:    fun multiply(other: Matrix): Matrix {
28:        require(cols == other.rows) {
29:            "Left matrix's column count must match right matrix's row count to multiply"
30:        }
31:        return Matrix((0 until rows).map { r ->
32:            (0 until other.cols).map { c ->
33:                (0 until cols).sumOf { k -> this[r, k] * other[k, c] }
34:            }
35:        })
36:    }
37:
38:    fun transpose(): Matrix { // ← new
39:        return Matrix((0 until cols).map { c -> (0 until rows).map { r -> this[r, c] } }) // ← new
40:    } // ← new
41: }
```

`Matrix` now has its first operation that reshapes a single matrix
rather than combining two — no `other: Matrix` parameter, no `require`
at all, since a `Matrix`'s own `rows` and `cols`, already guaranteed
real by the first unit of this lesson, are all `transpose` ever needs.

### Mechanical Walkthrough

- `fun transpose(): Matrix` — a method declaration taking no parameters
  at all, unlike every operation built so far in this lesson — a real,
  visible signal that this operation genuinely needs nothing but the
  receiver `Matrix` itself.
- `(0 until cols)` — the same real `until` function, here producing
  every *column* position of the receiver — deliberately the outer
  range this time, the reverse of every earlier unit's own row-outer
  ordering.
- `.map { c -> (0 until rows).map { r -> this[r, c] } }` — the outer
  `map`, one call per column `c` of the receiver, each one building one
  whole row of the *result*. Nested inside it, `(0 until rows)`, the
  receiver's own row range — deliberately the *inner* range here — and
  `.map { r -> this[r, c] }`, reading `this[r, c]` (the same two-parameter
  `get` already proven, called on the receiver itself) for every row `r`
  while `c` stays fixed for this particular outer call — exactly
  "reading straight down one original column" the isolated lab already
  proved, one result row at a time.
- `return Matrix(...)` — the same real constructor, here handed a grid
  whose row count is the receiver's own `cols` and whose column count is
  the receiver's own `rows` — genuinely swapped, and, once again,
  always rectangular by construction.

### CS Lens

Reshaping a structure's own layout without changing which real values it
holds is a real, recurring CS idea, closely related to the earlier CS
Lens's own **dot product**: **transpose**, specifically, recurs in: CSV
and spreadsheet tools that offer a real "transpose" button, turning a
table's own rows into columns for a different view of identical data;
image-processing libraries rotating pixel buffers; and database
"pivot"/"unpivot" operations, which reshape rows of data into columns
(or back) for reporting, without changing any of the underlying values
themselves.

### SE Lens

The alternative not chosen here is implementing `transpose` by directly
manipulating the private `data` field's own nested lists — swapping
indices by hand inside a loop, rather than reusing the same
`(0 until n).map { ... }` pattern, `get`, and `Matrix(...)` construction
every other operation in this lesson already uses. That path was
avoided for real consistency: every one of `Matrix`'s five new
operations now shares the identical real building blocks (`until`,
`map`, `this[r, c]`, a fresh `Matrix(...)` at the end), differing only in
which positions each one visits and what it does with each value — a
reader who understands any one of them already has almost everything
needed to read every other one. The real cost: `transpose`, like
`multiply`, allocates a brand-new `Matrix` — and a brand-new
`List<List<Int>>` underneath it — rather than reshaping in place; for
this project's own calculator-sized matrices, that's a real, acceptable
cost, not yet worth optimizing away.

### Commands Needed

Already compiled in the same batched pass. Run on its own with:

```
$ java -cp labs.jar Lab5_transposeKt
```

This unit's real project change was verified via
`./gradlew :app:compileDebugKotlin`, same as every earlier unit.

### Run It

```
[[1, 4], [2, 5], [3, 6]]
```

Real, saved at `verification/8.2/lab5_transpose.kt` and
`verification/8.2/lab5_transpose_run.txt`.

### Connect the Pieces

Every operation before this one either read one cell or combined two
whole matrices; `transpose` is the first to take exactly one `Matrix`
and hand back a genuinely reshaped one, using the same real building
blocks in a new order. The final unit of this lesson goes one step
further still — not reshaping a matrix, but reducing one all the way
down to a single real number.

## Concept Unit: Determinant

### The Problem

Every operation `Matrix` has so far returns another `Matrix`. A real
determinant is different in kind: it takes one whole matrix and reduces
it down to a single real number — and, unlike every earlier operation in
this lesson, it isn't defined for every matrix at all. A determinant
only exists, mathematically, for a **square matrix** — one whose row
count and column count are equal. A `2×3` matrix, for instance, has no
real determinant, not merely one this project hasn't implemented yet.
For the specific, real case this project needs — a `2×2` square
matrix — the actual formula is fixed and small: multiply the two values
on the main diagonal together, multiply the two values on the other
diagonal together, and subtract the second product from the first.

> This is the second time this lesson has needed to reject an input
> `Matrix` before doing any real work on it at all — the first was
> `multiply`'s own dimension check. Given that a non-square matrix has
> no real determinant, what condition would you check first, before
> anything else, inside a real `determinant` method? And given the real
> `2×2` formula just stated — top-left times bottom-right, minus
> top-right times bottom-left — which of `Matrix`'s own already-real
> tools (from every earlier unit in this lesson) would you use to read
> each of those four individual values?

### Introduce the Concept in Isolation

```kotlin
fun labDeterminant2x2(a: Int, b: Int, c: Int, d: Int): Int {
    return a * d - b * c
}

fun main() {
    println(labDeterminant2x2(4, 3, 2, 1))
}
```

Run for real, from this lesson's own batched compile:

```
-2
```

This real, executed output proves the real `2×2` formula, applied to a
matrix whose rows are `[4, 3]` and `[2, 1]`: `a` and `d` (`4` and `1`,
the main diagonal, top-left to bottom-right) multiply to `4`; `b` and
`c` (`3` and `2`, the other diagonal) multiply to `6`; the real result,
`4 - 6 = -2`, matches exactly what the isolated lab printed. This single
real number, computed this specific way from a square matrix, is called
the **determinant**.

### Discard the Throwaway Example

`labDeterminant2x2` is discarded now — but the exact `a * d - b * c`
formula it just proved, reading its four values through `Matrix`'s own
real `get`, is exactly what `Matrix`'s own real `determinant` needs.

### Project Change

- **Reference Source** — no reference counterpart; a from-scratch
  addition.
- **Files affected** —
  `app/src/main/java/com/example/calculator/Matrix.kt`.
- **Change type** — add (a new method inside the existing class).
- **Location** — inside `Matrix`, directly after `transpose`, added in
  the previous unit — the last method in the file.
- **Dependencies** — `Matrix`'s own `rows`, `cols`, and `get`.

### The New Code

```kotlin
fun determinant(): Int {
    require(rows == cols) { "Determinant is only defined for a square matrix" }
    require(rows == 2) { "This project's determinant only supports 2x2 matrices for now" }
    return this[0, 0] * this[1, 1] - this[0, 1] * this[1, 0]
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
13:    fun add(other: Matrix): Matrix {
14:        require(rows == other.rows && cols == other.cols) {
15:            "Matrices must have the same dimensions to add"
16:        }
17:        return Matrix((0 until rows).map { r -> (0 until cols).map { c -> this[r, c] + other[r, c] } })
18:    }
19:
20:    fun subtract(other: Matrix): Matrix {
21:        require(rows == other.rows && cols == other.cols) {
22:            "Matrices must have the same dimensions to subtract"
23:        }
24:        return Matrix((0 until rows).map { r -> (0 until cols).map { c -> this[r, c] - other[r, c] } })
25:    }
26:
27:    fun multiply(other: Matrix): Matrix {
28:        require(cols == other.rows) {
29:            "Left matrix's column count must match right matrix's row count to multiply"
30:        }
31:        return Matrix((0 until rows).map { r ->
32:            (0 until other.cols).map { c ->
33:                (0 until cols).sumOf { k -> this[r, k] * other[k, c] }
34:            }
35:        })
36:    }
37:
38:    fun transpose(): Matrix {
39:        return Matrix((0 until cols).map { c -> (0 until rows).map { r -> this[r, c] } })
40:    }
41:
42:    fun determinant(): Int { // ← new
43:        require(rows == cols) { "Determinant is only defined for a square matrix" } // ← new
44:        require(rows == 2) { "This project's determinant only supports 2x2 matrices for now" } // ← new
45:        return this[0, 0] * this[1, 1] - this[0, 1] * this[1, 0] // ← new
46:    } // ← new
47: }
```

`Matrix` now has all five real operations the BRD's own Slice 8 names —
`add`, `subtract`, `multiply`, `transpose`, and, with this unit,
`determinant` — the last one being the only one that reduces a whole
matrix down to a single number instead of producing another `Matrix`.

### Mechanical Walkthrough

- `fun determinant(): Int` — a method declaration taking no parameters,
  like `transpose`, but returning a plain `Int` instead of a `Matrix` —
  the real, visible signal that this operation's own result is one
  single number, not a grid.
- `require(rows == cols) { "Determinant is only defined for a square matrix" }`
  — the same real `require` already documented, checking the real
  **square matrix** condition named above: the receiver's own `rows`
  property must equal its own `cols` property. This is the domain check
  this unit's own Problem section named as necessary before any
  arithmetic runs at all.
- `require(rows == 2) { "This project's determinant only supports 2x2 matrices for now" }`
  — a second, separate `require` call, narrower than the first: even
  once a matrix is confirmed square, this project's own real
  `determinant` only actually computes an answer for the specific `2×2`
  case — a real, honest, stated scope limit, not a claim this method
  handles every square matrix.
- `this[0, 0] * this[1, 1] - this[0, 1] * this[1, 0]` — the real `2×2`
  formula proven in isolation, above, now reading its four values
  through `Matrix`'s own two-parameter `get`, proven in this lesson's
  second unit, instead of four bare parameters: `this[0, 0]` and
  `this[1, 1]` are the main diagonal (top-left, bottom-right); `this[0, 1]`
  and `this[1, 0]` are the other diagonal (top-right, bottom-left); `*`
  multiplies each real diagonal pair; `-` subtracts the second product
  from the first, the same real operator already used throughout
  `subtract`, applied here to two single numbers instead of two whole
  matrices.

### CS Lens

Reducing a whole structure down to one single, meaningful summary value
is a real, recurring CS idea: **reduction** (sometimes called "fold").
Also recognized in: a checksum, reducing an entire file's worth of bytes
down to one number used to detect corruption; a hash function, reducing
arbitrary data down to one fixed-size value; and, closer to this
project's own earlier work, `sumOf` itself, documented in this lesson's
own Header — every one of these takes a whole collection of values and
produces exactly one number that summarizes something real about all of
them together.

### SE Lens

The alternative not chosen here is implementing a real, general
determinant formula that works for a square matrix of *any* size —
mathematically well-defined (via cofactor expansion, a real, recursive
algorithm), but genuinely more code, and genuinely more expensive to
run, than this project's own real, current need justifies. This
project's own standing rule — no feature exists unless a concrete need
in the app actually requires it, nothing built speculatively — applies
here exactly as it has everywhere else in this curriculum: this project
has no real, shipped feature yet asking for a `3×3` or larger
determinant, so building general cofactor expansion now would be
speculative work carried indefinitely, on the chance some future lesson
needs it. The real, honest cost of the narrower choice actually made:
`Matrix.determinant()` will throw a real, real exception for a
perfectly valid `3×3` (or larger) *square* matrix — its own second
`require` check makes no distinction between "not square, this
operation is mathematically meaningless" and "square, but larger than
this project's current implementation supports," a real, deliberate
scope limit recorded here rather than silently left for a future session
to rediscover.

### Commands Needed

Already compiled in the same batched pass. Run on its own with:

```
$ java -cp labs.jar Lab6_determinant_2x2Kt
```

This unit's real project change was verified via
`./gradlew :app:compileDebugKotlin`, same as every earlier unit.

### Run It

```
-2
```

Real, saved at `verification/8.2/lab6_determinant_2x2.kt` and
`verification/8.2/lab6_determinant_2x2_run.txt`.

### Connect the Pieces

`transpose` reshaped one matrix into another matrix; `determinant`, this
lesson's own final operation, reduces one matrix all the way down to a
single real number, real square-matrix and real `2×2`-only checks
guarding it exactly like every earlier operation's own dimension checks
guarded them. `Matrix` now has every real operation this lesson set out
to build.

## Closing

### Connect the Pieces

One concrete matrix, `Matrix(listOf(listOf(1, 2), listOf(3, 4)))`,
traced through every unit built in this lesson: the first unit proved it
can be constructed at all only because its two rows genuinely match in
length — a real `init` block, calling real `require`, checks that the
instant this exact call runs, closing the gap this lesson's own
predecessor spent an entire unit proving was open. The second unit gave
this exact matrix a real, dedicated way to be read from —
`matrix[0, 1]` reaches `2` — without any outside code ever touching its
private backing data directly. The third unit combined it with a second,
same-shaped matrix, cell by corresponding cell, twice over, once with
`+` and once with `-`. The fourth unit combined it with a differently-
but-compatibly-shaped matrix instead, computing a real dot product per
result cell rather than a simple pairwise combination. The fifth unit
took this exact matrix alone and handed back a new one with its rows and
columns genuinely swapped. And the sixth, this lesson's own last,
reduced this exact matrix all the way down to one real number,
`1 × 4 - 2 × 3 = -2`, guarded first by a real check that it's square at
all. Every one of these six real, distinct ideas — constructor
validation, a purpose-built accessor, element-wise combination, the dot
product, reshaping, and reduction — now lives permanently inside one
real, tested `Matrix.kt`, real, verified via a full
`./gradlew testDebugUnitTest assembleDebug` run covering this project's
entire existing test suite alongside ten new, real, passing tests in a
new `MatrixTest.kt` — one per real behavior this lesson built, including
every real, thrown-exception case alongside every real, computed-result
case. This project now has 66 real, passing tests.

**Next:** Lesson 8.3 turns to algorithm complexity — understanding, with
real, measured or counted evidence, exactly why this lesson's own
`multiply` costs genuinely more to run than `add` or `subtract` do, the
same real discipline this project's own earlier complexity lesson
already applied to its calculator's own display-typing code.
