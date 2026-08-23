# Lesson 8.6: The Class That Doesn't Know Its Own Numbers

*Generics*

- **What you will build.** `Matrix` itself, rewritten to be genuinely
  generic — `Matrix<T>` — so it can hold `Int` cells, `Double` cells, or
  any other type at all, with its own shape, validation, and single-cell
  access working identically regardless of which. `add`, `subtract`,
  `multiply`, and `determinant` move out of `Matrix` itself and become
  real extension functions, scoped specifically to `Matrix<Int>` — the
  concrete fix for a genuine Kotlin limitation this lesson proves for
  real. And, finally, a real `Matrix<Double>.inverse()` — this project's
  own oldest open promise, closed for real, using exactly the numeric
  type this lesson's own earlier work already proved it needs.
- **What you need to know first.** This lesson's own four direct
  predecessors — `Matrix`'s real constructor, `rows`, `cols`, `get`,
  `transpose`, `identity`, and every one of its current operations; this
  project's own already-real, decisive proof that a correct inverse
  needs `Double`, not `Int`; Lesson 0.9's own extension functions
  (`Calculation.describe()`); Lesson 8.1's own generic type parameters,
  there only ever *used* (`List<Int>`), never *declared* by this
  project's own code.

## Terms used in this lesson

- **Generic class** — a class an author declares with its own type
  parameter (`class Matrix<T>`), rather than one that merely *uses* an
  already-generic type someone else declared. This is a deeper
  application of the already-established idea of a generic type
  parameter: the type placeholder isn't just filled in at a call site
  anymore, it's declared, by name, as part of a real class this project
  owns. This exists so one real class's own shape and behavior — a
  validated, indexable 2D grid, in `Matrix`'s own case — can be reused
  for any element type at all, without writing a separate, nearly
  identical class per type.
- **Extension function** — a function declared outside a class's own
  body that can still be called using that class's own instances with
  ordinary dot-call syntax, as if it had been declared as a real member.
  Already established in this project's own earlier work; this lesson's
  own new angle is scoping one to a specific *generic instantiation* —
  `Matrix<Int>`, not bare `Matrix` — so the extension is only callable on
  a `Matrix` actually holding `Int` cells, invisible on one holding
  anything else. This exists because Kotlin lets an extension's own
  receiver type be as narrow or as broad as its author needs, down to
  one specific filled-in type parameter.

## Objects and methods used

- **`Matrix<T>`**
  - *What it is:* this project's own real `Matrix` class, rewritten this
    lesson to be genuinely generic — this entire lesson's own real
    subject.
  - *Implementation:* `data class Matrix<T>(private val data: List<List<T>>)`,
    with `val rows: Int`, `val cols: Int`, a real `init` block, a real
    two-parameter `operator fun get(row: Int, col: Int): T`, and a real
    `fun transpose(): Matrix<T>` — every one of these members works
    identically for any `T` at all, since none of them ever performs
    arithmetic on a cell's own value, only stores, counts, or repositions
    it.
  - *Its use:* every real matrix this project builds, of any element
    type, is now a `Matrix<T>` with `T` filled in — `Matrix<Int>` for
    this project's own existing scalar-cell matrices, `Matrix<Double>`
    for this lesson's own new, real inverse.
  - *Type:* a generic `data class`.
  - *Responsibility:* to guarantee, for *any* element type `T`, that a
    constructed instance is genuinely rectangular, and to provide
    type-agnostic shape and access (`rows`, `cols`, `get`, `transpose`)
    — never arithmetic, which depends on what `T` actually is.
  - *Depends on:* a real `List<List<T>>` handed to its constructor, for
    whatever concrete `T` the caller chooses.
  - *Connects to:* built directly by callers, and by
    `Matrix.identity(size)` (returning a concrete `Matrix<Int>`);
    extended by `Matrix<Int>.add`/`.subtract`/`.multiply`/`.determinant`
    and `Matrix<Double>.inverse`, below, each adding real, type-specific
    behavior `Matrix<T>` itself deliberately does not provide.
  - *Shape:* a public, permanent, generic domain type — the real,
    reusable shape underneath every concrete matrix this project builds,
    regardless of what numeric (or, in principle, non-numeric) type it
    actually holds.
- **`Matrix<Int>.add`, `.subtract`, `.multiply`, `.determinant`**
  - *What it is:* this project's own four existing matrix operations,
    relocated this lesson from members of `Matrix` itself to real
    extension functions on the specific instantiation `Matrix<Int>` —
    the concrete fix this lesson's own first unit proves is necessary.
  - *Implementation:* `fun Matrix<Int>.add(other: Matrix<Int>): Matrix<Int>`,
    `fun Matrix<Int>.subtract(other: Matrix<Int>): Matrix<Int>`,
    `fun Matrix<Int>.multiply(other: Matrix<Int>): Matrix<Int>`, and
    `fun Matrix<Int>.determinant(): Int` — four real top-level functions,
    each with `Matrix<Int>` as its own receiver type, their own real
    bodies byte-for-byte unchanged from before this lesson's own
    refactor.
  - *Its use:* every existing caller of `a.add(b)`, `a.subtract(b)`,
    `a.multiply(b)`, or `a.determinant()` continues to work, completely
    unchanged, the moment `a` is a real `Matrix<Int>` — which every one
    of this project's own existing real callers already is.
  - *Type:* four separate top-level extension functions.
  - *Responsibility:* unchanged from before this lesson — `add`/
    `subtract` combine two same-shaped `Matrix<Int>`s cell by cell;
    `multiply` combines two compatibly-shaped ones via a real dot
    product; `determinant` reduces one square `Matrix<Int>` to a single
    `Int`.
  - *Depends on:* unchanged — real `Matrix<Int>` receivers/arguments;
    `require`, `until`, `map`, `sumOf`, all already established.
  - *Connects to:* `add`/`multiply` still call `MatrixAddition`/
    `MatrixMultiplication`, themselves retyped this lesson to operate on
    `Matrix<Int>` explicitly rather than the no-longer-existing bare
    `Matrix`.
  - *Shape:* a public API surface — unchanged in every real respect
    except *where* it's declared, which is this lesson's own real point.
- **`Matrix<Double>.inverse`**
  - *What it is:* this project's own real matrix inverse — this lesson's
    own headline addition, closing the real, open promise this
    project's own earlier work made and could not yet keep.
  - *Implementation:* `fun Matrix<Double>.inverse(): Matrix<Double>`,
    checking `rows == cols` (square) and `rows == 2` (this project's own
    already-established `2×2`-only scope limit, matching `determinant`'s
    own), computing `det = this[0, 0] * this[1, 1] - this[0, 1] * this[1, 0]`,
    checking `det != 0.0` (a matrix with a zero determinant has no real
    inverse at all), and returning
    `Matrix(listOf(listOf(this[1, 1] / det, -this[0, 1] / det), listOf(-this[1, 0] / det, this[0, 0] / det)))`
    — the identical real `2×2` inverse formula this project's own
    earlier work already proved correct, now computing on genuine
    `Double` cells instead of a throwaway lab's bare parameters.
  - *Its use:* this is the real, first, working answer to BRD's own
    Slice 8 plan naming a matrix inverse alongside addition and
    multiplication — deliberately deferred until now, deliberately built
    only once `Matrix<T>` could actually hold the non-integer values a
    correct inverse genuinely requires.
  - *Type:* a top-level extension function, receiver type `Matrix<Double>`.
  - *Responsibility:* to compute the real, mathematically correct
    inverse of a `2×2` square `Matrix<Double>`, refusing outright — via
    `require` — rather than silently returning a wrong or meaningless
    result, whenever the receiver isn't square, isn't `2×2`, or has no
    real inverse at all (a zero determinant).
  - *Depends on:* a real `Matrix<Double>` receiver; `require`, `get`.
  - *Connects to:* called directly by this lesson's own real tests;
    calls `Matrix`'s own `get` (now returning `Double` for this specific
    receiver type) and constructs a fresh `Matrix<Double>`.
  - *Shape:* a public API surface — a genuinely new one, this project's
    first operation that only exists for one specific, non-`Int`
    instantiation of `Matrix<T>`.
- **`require`**
  - *What it is:* the real, top-level Kotlin standard-library
    precondition-checking function, already fully documented in this
    lesson's own predecessors.
  - *Implementation:* `public inline fun require(value: Boolean, lazyMessage: () -> Any): Unit`
    — unchanged.
  - *Its use:* unchanged in every real use across this lesson — checking
    square-ness, `2×2`-ness, non-zero determinants, and every dimension
    rule this project's own matrix operations already relied on it for.
  - *Type:* a top-level, inline function.
  - *Responsibility:* unchanged — one consistent way of stating "this
    must be true for what comes next to make sense" and failing loudly,
    immediately, the instant it isn't.
  - *Depends on:* unchanged — the `Boolean` condition to check and a
    `lazyMessage` function supplying the real exception's message.
  - *Connects to:* called by `Matrix<T>`'s own `init` block and by every
    real operation across all three of this lesson's units.
  - *Shape:* unchanged — a public stdlib API surface.
- **`until`**
  - *What it is:* the real, infix Kotlin standard-library function,
    already fully documented in this lesson's own predecessors, building
    a range of consecutive integers.
  - *Implementation:* `public infix fun Int.until(to: Int): IntRange` —
    unchanged.
  - *Its use:* unchanged — `Matrix<T>`'s own `transpose` and
    `Matrix.identity` both still use it exactly as before.
  - *Type:* an infix extension function on `Int`.
  - *Responsibility:* unchanged — to produce one real `IntRange`
    representing every integer from its start up to, but not including,
    its end.
  - *Depends on:* unchanged — the `Int` receiver (start) and the `to`
    argument (exclusive end).
  - *Connects to:* called directly by `Matrix<T>`'s own `transpose` and
    `identity`; its result is handed to `map`, below.
  - *Shape:* unchanged — a public stdlib API surface.
- **`map`**
  - *What it is:* the real Kotlin standard-library function, already
    fully documented in this lesson's own predecessors, building a new
    list by transforming every element of an existing collection.
  - *Implementation:* `public inline fun <T, R> Iterable<T>.map(transform: (T) -> R): List<R>`
    — unchanged. (This is the real stdlib `map`'s own type parameter,
    unrelated to `Matrix<T>`'s own — the same letter, two genuinely
    different, independently-scoped generic declarations.)
  - *Its use:* unchanged — the same nested `map`-over-`until` shape
    every real `Matrix<T>` and `Matrix<Int>` operation already uses.
  - *Type:* a generic, inline extension function on `Iterable<T>`.
  - *Responsibility:* unchanged — to produce exactly one new output
    element per input element, in order.
  - *Depends on:* unchanged — the receiver collection and a `transform`
    function.
  - *Connects to:* called on ranges from `until`, nested inside itself,
    throughout `Matrix<T>` and its extension functions alike.
  - *Shape:* unchanged — a public, foundational stdlib API surface.
- **`sumOf`**
  - *What it is:* the real Kotlin standard-library function, already
    fully documented in this lesson's own predecessors, adding up a
    number computed from every element of a collection into one total.
  - *Implementation:* `public inline fun <T> Iterable<T>.sumOf(selector: (T) -> Int): Int`
    — unchanged.
  - *Its use:* unchanged — `MatrixMultiplication`'s own real dot-product
    calculation.
  - *Type:* a generic, inline extension function on `Iterable<T>`.
  - *Responsibility:* unchanged — to compute one running total by
    calling `selector` once per element and adding each result.
  - *Depends on:* unchanged — the receiver collection and a `selector`
    function.
  - *Connects to:* called on a range from `until`, inside
    `MatrixMultiplication.apply`.
  - *Shape:* unchanged — a public stdlib API surface.

Every real signature quoted above was already fetched and confirmed from
the genuine, currently-installed `kotlin-stdlib-sources.jar` in this
lesson's own predecessors, and restated here in full per this schema's
own Repetition Rule.

## Concept Unit: Declaring a Generic Class

### The Problem

`Matrix` today only ever holds `Int` cells — its own constructor is
`Matrix(private val data: List<List<Int>>)`, `Int` written directly into
its own declaration. This project's own earlier work already proved,
decisively, that a correct matrix inverse needs `Double` cells instead.
`Matrix` itself has to change to make that possible — but does it need a
second, separate `DoubleMatrix` class, duplicating every real line of
`Matrix`'s own shape, validation, and access logic, or can one class
genuinely serve both?

> This project already has real experience with `List<T>` — a generic
> type this project has
> only ever *used*, filling in `T` with `Int` or `List<Int>` at the call
> site, never declaring a `<T>` of its own. Given that `Matrix`'s own
> `rows`, `cols`, `get`, and `transpose` never actually perform
> arithmetic on a cell's value — they only store it, count it, or move
> it to a new position — do any of them genuinely need to know whether a
> cell holds an `Int`, a `Double`, or anything else at all? If not, what
> would `Matrix`'s own declaration need to look like for it to work for
> any of them, the same way `List<T>` already does?

### Introduce the Concept in Isolation

```kotlin
class LabBox<T>(val value: T)

fun <T> showBox(box: LabBox<T>): T = box.value

fun main() {
    val intBox = LabBox(5)
    val stringBox = LabBox("hello")
    println(showBox(intBox))
    println(showBox(stringBox))
}
```

Run for real, batch-compiled with this lesson's other two working labs
via a single `kotlinc` pass (see Commands Needed, below):

```
5
hello
```

This real, executed output proves a class an author declares themselves
— not just one already provided by the standard library — can be
genuinely generic: `LabBox<T>`, with `T` filled in as `Int` for
`intBox` and as `String` for `stringBox`, both real, valid, working
instances of the identical class declaration. `showBox`, itself declared
with its own `<T>`, accepts either one and hands back the correct real
value, correctly typed, each time. This is called declaring a **generic
class** — the deeper, author's-own-side application of the generic type
parameter idea this project already proved from the *user's* side, back
when `List<T>` was first introduced.

A real, decisive negative case proves the real limit of what a bare,
unconstrained `T` can do:

```kotlin
class LabPair<T>(val a: T, val b: T) {
    fun combine(): T = a + b
}
```

```
break1_unconstrained_plus.kt:2:26: error: none of the following candidates is applicable:

fun BigDecimal.plus(other: BigDecimal): BigDecimal:
  Unresolved reference. None of the following candidates is applicable because of a receiver type mismatch:
fun BigDecimal.plus(other: BigDecimal): BigDecimal

fun BigInteger.plus(other: BigInteger): BigInteger:
  Unresolved reference. None of the following candidates is applicable because of a receiver type mismatch:
fun BigInteger.plus(other: BigInteger): BigInteger

[... the real, full compiler output continues for 259 lines total, one
matching attempt per real `plus` overload anywhere in scope — every
array type, every collection type, `String`, `Char`, `Sequence`, and
more — each one rejected the same way; full, untruncated output saved
at `verification/8.6/break1_full_output.txt` ...]

    fun combine(): T = a + b
                         ^
```

This real, genuine compile error — far larger and more thorough than a
simple "unresolved reference," because Kotlin's own compiler really does
try *every* `plus` overload currently in scope before giving up — proves
the real, concrete limit this unit's own Problem section asked about:
an unconstrained `T` supports none of `Matrix`'s own current arithmetic
operators at all, because `T` could be anything, and nothing about
"anything" guarantees a `plus` operator exists for it. This is the real,
decisive reason `Matrix<T>` itself cannot keep `add`/`subtract`/
`multiply`/`determinant` as its own members once it becomes generic.

### Discard the Throwaway Example

`LabBox`, `showBox`, and the deliberately broken `LabPair` are discarded
now — but the real, proven mechanism (a class declaring its own `<T>`)
and the real, proven limit (unconstrained `T` supports no arithmetic
operators) are both exactly what `Matrix`'s own real rewrite depends on.

### Project Change

- **Reference Source** — no reference counterpart; a from-scratch
  rewrite of this project's own existing `Matrix` class.
- **Files affected** —
  `app/src/main/java/com/example/calculator/Matrix.kt`.
- **Change type** — refactor (`Matrix`'s own declaration, and every
  member that doesn't perform arithmetic).
- **Location** — `Matrix`'s own class header and its `rows`/`cols`/
  `init`/`get`/`transpose` members.
- **Dependencies** — none beyond what `Matrix.kt` already had.

### The New Code

```kotlin
data class Matrix<T>(private val data: List<List<T>>) {
    val rows: Int = data.size
    val cols: Int = if (data.isEmpty()) 0 else data[0].size

    init {
        require(data.all { it.size == cols }) {
            "All rows must have the same number of columns"
        }
    }

    operator fun get(row: Int, col: Int): T = data[row][col]

    fun transpose(): Matrix<T> {
        return Matrix((0 until cols).map { c -> (0 until rows).map { r -> this[r, c] } })
    }
}
```

### The Updated Project

```kotlin
1:  data class Matrix<T>(private val data: List<List<T>>) { // ← changed
2:      val rows: Int = data.size
3:      val cols: Int = if (data.isEmpty()) 0 else data[0].size
4:
5:      init {
6:          require(data.all { it.size == cols }) {
7:              "All rows must have the same number of columns"
8:          }
9:      }
10:
11:     operator fun get(row: Int, col: Int): T = data[row][col] // ← changed
12:
13:     fun transpose(): Matrix<T> { // ← changed
14:         return Matrix((0 until cols).map { c -> (0 until rows).map { r -> this[r, c] } })
15:     }
16:
17:     companion object {
18:         fun identity(size: Int): Matrix<Int> { // ← changed
19:             return Matrix((0 until size).map { r -> (0 until size).map { c -> if (r == c) 1 else 0 } })
20:         }
21:     }
22: }
```

`Matrix` itself now has three real changes: its own class header
(`Matrix<T>`, not bare `Matrix`), `get`'s own return type (`T`, not
`Int`), and `transpose`'s own return type (`Matrix<T>`, not `Matrix`) —
`identity`'s own return type also changed, from bare `Matrix` to the
concrete `Matrix<Int>`, since `identity` always builds a real matrix of
whole numbers (`1`s and `0`s) specifically, regardless of what `T` a
caller might otherwise want. `add`, `subtract`, `multiply`, and
`determinant` are gone from inside this class entirely — the next unit
covers exactly where they went.

### Mechanical Walkthrough

Every changed element of the class above, in the order it appears:

- `data class Matrix<T>(private val data: List<List<T>>)` — the class
  header, now declaring its own generic type parameter `<T>`, the real
  construct proven in isolation above. The constructor parameter's own
  type changes from `List<List<Int>>` to `List<List<T>>` — a real
  `Matrix` instance's own `data` now holds whatever concrete type `T`
  gets filled in as, decided the moment a real caller writes
  `Matrix(...)` with some real, concrete list of lists.
- `operator fun get(row: Int, col: Int): T` — the same real two-parameter
  `get` operator already fully documented in this lesson's own
  predecessors, its own return type changed from the hardcoded `Int` to
  `T` — it still reads `data[row][col]`, and that expression's own type
  is now genuinely `T`, whatever concrete type this specific `Matrix`
  instance actually holds.
- `fun transpose(): Matrix<T>` — the same real reshaping operation
  already fully documented, its own return type changed from `Matrix` to
  `Matrix<T>` — the transposed result holds the exact same concrete type
  as the original, since transposing only ever repositions existing
  values, never computes new ones.
- `fun identity(size: Int): Matrix<Int>` — `identity`'s own return type,
  inside the unchanged `companion object` block, now explicitly names
  `Matrix<Int>` rather than the no-longer-valid bare `Matrix` — a real,
  necessary change, but not one requiring `identity`'s own body to
  change at all: it always built a grid of `1`s and `0`s, real `Int`
  values, and continues to.

### CS Lens

A class whose own real capabilities — storing, counting, indexing,
reshaping — don't actually depend on what specific type it holds is a
real, recurring CS idea: **generic programming**. Also recognized in:
every real container type in every mainstream language's own standard
library (`List<T>`, `Map<K, V>`, arrays); a real `Stack<T>` or `Queue<T>`
implementation (this project's own Stage 5 already built both,
concretely, for `String`s specifically — a real, earlier, narrower
version of exactly the generalization this lesson now performs on
`Matrix`); and any real sorting algorithm that works identically
regardless of what's being sorted, as long as a way to compare two
elements exists.

### SE Lens

The alternative not chosen here is a real, separate `DoubleMatrix`
class, built from scratch alongside `Matrix`, duplicating every real
line of shape, validation, and access logic that has nothing to do with
which numeric type is actually stored. That alternative was rejected for
a real, concrete reason, proven by this unit's own real negative-case
compile: the *only* real obstacle to a single, shared `Matrix<T>` was
arithmetic, and `rows`/`cols`/`get`/`transpose`/the `init` block's own
validation never touch arithmetic at all — duplicating all of that
purely to isolate the one real part (`add`/`subtract`/`multiply`/
`determinant`) that genuinely needs to change would have been real,
unjustified repetition. The real cost of the shared-class design chosen
instead: `Matrix<T>` alone is now a genuinely incomplete matrix — it can
be built, read, and reshaped, but not combined or reduced with any real
arithmetic at all, for *any* `T`, until something outside the class
itself adds that back. The next unit is exactly that.

### Commands Needed

The three working labs (`lab1_generic_class.kt`, this lesson's second
unit's own lab, and its third unit's own lab) were compiled together in
one real, batched pass:

```
$ kotlinc lab1_generic_class.kt lab2_extension_on_instantiation.kt lab3_generic_inverse.kt -include-runtime -d labs.jar
```

Run on its own with:

```
$ java -cp labs.jar Lab1_generic_classKt
```

The deliberately broken `break1_unconstrained_plus.kt` was compiled
separately, since it's meant to fail:

```
$ kotlinc break1_unconstrained_plus.kt -include-runtime -d break1.jar
```

This unit's own real project change was verified with
`./gradlew :app:compileDebugKotlin` (the full test suite is covered at
the end of this lesson, in the Closing, once every unit's own change is
in place).

### Run It

```
5
hello
```

Real, saved at `verification/8.6/lab1_generic_class.kt` and
`verification/8.6/lab1_generic_class_run.txt`; the real, full 259-line
negative-case compile at
`verification/8.6/break1_unconstrained_plus.kt` and
`verification/8.6/break1_unconstrained_plus_run.txt` (with the complete,
untruncated compiler output also saved separately at
`break1_full_output.txt`).

### Connect the Pieces

`Matrix` is now genuinely generic — buildable, readable, and
reshapeable for any element type at all — but its own real arithmetic
operations no longer exist anywhere. The next unit proves exactly where
they went, and why that specific new location is the real, correct fix.

## Concept Unit: Extension Functions on One Specific Instantiation

### The Problem

`add`, `subtract`, `multiply`, and `determinant` need a real home again
— but not back inside `Matrix<T>` itself, since the previous unit's own
real, negative-case compile already proved an unconstrained `T` supports
none of the real arithmetic operators they need. Every one of this
project's own real, existing callers still needs `a.add(b)`,
`a.determinant()`, and so on, to keep working, completely unchanged, for
the `Matrix<Int>` values this project already builds everywhere. Is
there a real way to give these four operations back their exact,
familiar call-site syntax, while keeping them genuinely restricted to
`Int`-holding matrices specifically?

> This project already has real experience with extension functions
> adding real behavior to
> an existing class from outside its own body — `Calculation.describe()`
> being this project's own first real example. An extension function's
> own *receiver type* is just an ordinary type, written before the dot in
> its own declaration (`fun Calculation.describe(): String`). Given that
> `Matrix<Int>` and `Matrix<Double>` are both genuinely different,
> specific types now — not just "`Matrix`" — what would an extension
> function's own receiver type need to say for it to be callable only on
> a `Matrix` holding `Int` cells, and invisible on one holding anything
> else? And given that this project's own `add`/`subtract`/`multiply`/
> `determinant` already had real, correct, tested bodies before this
> lesson began, would you expect moving each one outside `Matrix` itself
> to require rewriting any of that real logic, or just relocating it,
> unchanged, to a new real home?

### Introduce the Concept in Isolation

```kotlin
class LabContainer<T>(val value: T)

fun LabContainer<Int>.doubled(): Int = value * 2

fun main() {
    val c = LabContainer(21)
    println(c.doubled())
}
```

Run for real, from this lesson's own batched compile:

```
42
```

This real, executed output proves an extension function's own receiver
type can genuinely name one specific generic instantiation —
`LabContainer<Int>`, not bare `LabContainer<T>` — and still work exactly
like an ordinary member function from the calling code's own point of
view: `c.doubled()`, ordinary dot-call syntax, no special ceremony
required to reach a function declared completely outside `LabContainer`'s
own body.

A second, real, negative-case compile proves the real restriction is
genuine, not just documentation:

```kotlin
class LabContainer<T>(val value: T)

fun LabContainer<Int>.doubled(): Int = value * 2

fun main() {
    val c = LabContainer("hello")
    println(c.doubled())
}
```

```
break2_extension_wrong_type.kt:7:15: error: unresolved reference. None of the following candidates is applicable because of a receiver type mismatch:
fun LabContainer<Int>.doubled(): Int
    println(c.doubled())
              ^^^^^^^
```

This real, genuine compile error proves `doubled()` really is invisible
on a `LabContainer<String>` — the exact same real function, the exact
same call syntax, refused outright the moment the concrete type filled
in for `T` doesn't match the extension's own declared receiver type.

### Discard the Throwaway Example

`LabContainer` and `doubled()` — both the working version and the
deliberately broken one — are discarded now — but the real, proven
mechanism (an extension function scoped to one specific generic
instantiation) is exactly what `Matrix`'s own four displaced operations
need.

### Project Change

- **Reference Source** — this lesson's own first unit, whose real
  refactor removed `add`/`subtract`/`multiply`/`determinant` from
  `Matrix<T>`'s own body — their own real logic, quoted verbatim here,
  not rewritten.
- **Files affected** —
  `app/src/main/java/com/example/calculator/Matrix.kt`.
- **Change type** — add (four new top-level extension functions), plus a
  small retyping of `MatrixOperation`/`MatrixAddition`/`MatrixMultiplication`'s
  own signatures.
- **Location** — the four new functions sit at the top level of
  `Matrix.kt`, directly after `Matrix<T>`'s own closing brace, before
  `MatrixOperation`.
- **Dependencies** — `Matrix<T>`'s own `rows`, `cols`, and `get`;
  `MatrixAddition`/`MatrixMultiplication`, both retyped this same unit.

### The New Code

```kotlin
fun Matrix<Int>.add(other: Matrix<Int>): Matrix<Int> = MatrixAddition.apply(this, other)

fun Matrix<Int>.subtract(other: Matrix<Int>): Matrix<Int> {
    require(rows == other.rows && cols == other.cols) {
        "Matrices must have the same dimensions to subtract"
    }
    return Matrix((0 until rows).map { r -> (0 until cols).map { c -> this[r, c] - other[r, c] } })
}

fun Matrix<Int>.multiply(other: Matrix<Int>): Matrix<Int> = MatrixMultiplication.apply(this, other)

fun Matrix<Int>.determinant(): Int {
    require(rows == cols) { "Determinant is only defined for a square matrix" }
    require(rows == 2) { "This project's determinant only supports 2x2 matrices for now" }
    return this[0, 0] * this[1, 1] - this[0, 1] * this[1, 0]
}
```

### The Updated Project

```kotlin
1:  interface MatrixOperation {
2:      fun apply(a: Matrix<Int>, b: Matrix<Int>): Matrix<Int> // ← changed
3:  }
4:
5:  object MatrixAddition : MatrixOperation {
6:      override fun apply(a: Matrix<Int>, b: Matrix<Int>): Matrix<Int> { // ← changed
7:          require(a.rows == b.rows && a.cols == b.cols) {
8:              "Matrices must have the same dimensions to add"
9:          }
10:         return Matrix((0 until a.rows).map { r -> (0 until a.cols).map { c -> a[r, c] + b[r, c] } })
11:     }
12: }
13:
14: object MatrixMultiplication : MatrixOperation {
15:     override fun apply(a: Matrix<Int>, b: Matrix<Int>): Matrix<Int> { // ← changed
16:         require(a.cols == b.rows) {
17:             "Left matrix's column count must match right matrix's row count to multiply"
18:         }
19:         return Matrix((0 until a.rows).map { r ->
20:             (0 until b.cols).map { c ->
21:                 (0 until a.cols).sumOf { k -> a[r, k] * b[k, c] }
22:             }
23:         })
24:     }
25: }
```

`MatrixOperation`'s own contract, and both of its real implementations,
now name `Matrix<Int>` explicitly rather than the no-longer-valid bare
`Matrix` — real, necessary retyping, with neither implementation's own
actual logic changing by a single character. `add` and `multiply`, the
two new extension functions shown in The New Code above, call straight
through to these unchanged real bodies, exactly as they did before this
lesson, before `Matrix<T>` existed at all.

### Mechanical Walkthrough

- `fun Matrix<Int>.add(other: Matrix<Int>): Matrix<Int>` — a top-level
  function declaration whose own receiver type, written before the dot,
  is `Matrix<Int>` — the real construct proven in isolation above. Its
  own body, `= MatrixAddition.apply(this, other)`, is byte-for-byte
  identical to `add`'s own body from before this lesson; only its real
  location — outside `Matrix<T>`'s own body entirely — has changed.
- `fun Matrix<Int>.subtract(other: Matrix<Int>): Matrix<Int> { ... }` —
  the same real receiver-type pattern, its own body — the `require`
  check and the nested `until`/`map` construction — unchanged from
  before this lesson, character for character.
- `fun Matrix<Int>.multiply(other: Matrix<Int>): Matrix<Int>` — the same
  pattern once more, delegating to the now-retyped `MatrixMultiplication.apply`.
- `fun Matrix<Int>.determinant(): Int` — the same pattern, its own real
  `2×2` formula and its own two `require` checks unchanged from before
  this lesson.

### CS Lens

Restricting a piece of behavior to one specific, concrete instantiation
of an otherwise-generic type, rather than the fully generic type itself,
is a real, recurring CS idea: **type-specific extension**. Also
recognized in: real numeric libraries offering operations (like matrix
inversion, or a real statistical mean) only on their own
floating-point-typed containers, never their integer-typed ones, for the
identical real reason this lesson's own `inverse` will be restricted to
`Matrix<Double>` next; and, more broadly, any real API surface that
grows *conditionally* — present only for callers whose own generic type
argument happens to satisfy some real, specific requirement.

### SE Lens

The alternative not chosen here is a bounded generic type parameter —
`class Matrix<T : Number>` — constraining `T` to Kotlin's own `Number`
supertype, then attempting to write `add`/`multiply`/`determinant`
generically against that bound. That path was investigated conceptually
and rejected: Kotlin's own real `Number` type does not itself declare
`plus`, `minus`, or `times` at all (each concrete numeric type —
`Int`, `Double`, and the rest — defines its own, separately, with no
shared arithmetic contract unifying them) — bounding `T` to `Number`
would not actually restore any of the four displaced operations without
a real, custom-written interface bridging that gap, itself a genuinely
bigger, more speculative undertaking than this project's own real,
current need (exactly `Int` arithmetic, and, as of this lesson's own
third unit, exactly one `Double` operation) actually justifies. Extension
functions scoped to one concrete instantiation at a time, chosen
instead, cost real, minor duplication — `Matrix<Int>` and, if this
project ever needed `Double` addition too, a second, separately-written
`Matrix<Double>.add` — in exchange for using nothing beyond what Kotlin
already, genuinely supports today, with zero speculative machinery
built for a need that doesn't yet exist.

### Commands Needed

Already compiled in the same batched pass documented in the previous
unit. Run on its own with:

```
$ java -cp labs.jar Lab2_extension_on_instantiationKt
```

The deliberately broken `break2_extension_wrong_type.kt` was compiled
separately:

```
$ kotlinc break2_extension_wrong_type.kt -include-runtime -d break2.jar
```

This unit's own real project change was verified with
`./gradlew :app:compileDebugKotlin`.

### Run It

```
42
```

Real, saved at `verification/8.6/lab2_extension_on_instantiation.kt` and
`verification/8.6/lab2_extension_on_instantiation_run.txt`; the real
negative-case compile at
`verification/8.6/break2_extension_wrong_type.kt` and
`verification/8.6/break2_extension_wrong_type_run.txt`.

### Connect the Pieces

`Matrix<Int>` can now do everything a `Matrix` could do before this
lesson began — build, read, reshape, add, subtract, multiply, take a
determinant — with every real call site completely unchanged, even
though `add`/`subtract`/`multiply`/`determinant` no longer live inside
`Matrix` itself. The final unit puts this exact same real mechanism to
its actual, motivating use: a real operation that only ever made sense
for one specific instantiation to begin with.

## Concept Unit: A Real Inverse, At Last

### The Problem

This project's own earlier work already proved, decisively, exactly
what a correct `2×2` inverse requires: `Double` division, not `Int`.
`Matrix<T>` can now genuinely hold `Double` cells, and the previous
unit just proved extension functions can be scoped to one specific
instantiation. Is that enough, together, to finally build a real,
correct `Matrix<Double>.inverse()` — and if a matrix's own determinant
happens to be exactly zero, what should happen instead of a real
answer?

> The real `2×2` inverse formula divides four values by a real
> determinant. A determinant of exactly `0` would make every one of
> those four divisions divide by zero. This project's own earlier
> work already has a real, established pattern for refusing to proceed
> when a real precondition isn't met, used throughout every one of
> `Matrix`'s own existing operations. What would you check, and how,
> before attempting any of the four real divisions the formula needs?
> And given that `determinant()` already checks both squareness and its
> own `2×2`-only scope limit as two separate real checks rather than one
> combined condition, would you expect `inverse()`'s own real
> precondition checks to follow that same separated shape, or would one
> combined check genuinely serve just as well here?

### Introduce the Concept in Isolation

```kotlin
class LabMatrix<T>(private val data: List<List<T>>) {
    operator fun get(row: Int, col: Int): T = data[row][col]
}

fun LabMatrix<Double>.inverse(): LabMatrix<Double> {
    val det = this[0, 0] * this[1, 1] - this[0, 1] * this[1, 0]
    return LabMatrix(listOf(
        listOf(this[1, 1] / det, -this[0, 1] / det),
        listOf(-this[1, 0] / det, this[0, 0] / det)
    ))
}

fun main() {
    val m = LabMatrix(listOf(listOf(4.0, 3.0), listOf(2.0, 1.0)))
    val inv = m.inverse()
    println("${inv[0, 0]} ${inv[0, 1]} ${inv[1, 0]} ${inv[1, 1]}")
}
```

Run for real, from this lesson's own batched compile:

```
-0.5 1.5 1.0 -2.0
```

This real, executed output proves the complete real mechanism, all at
once: a genuinely generic `LabMatrix<T>`, an extension function scoped
specifically to `LabMatrix<Double>`, and the exact real `2×2` inverse
formula, computing on genuine `Double` cells this time rather than a
throwaway lab's bare, individually-named parameters — and producing
exactly the same real, correct answer, `-0.5`, `1.5`, `1.0`, `-2.0`,
this project's own earlier work already proved by hand. This is real,
decisive proof the full, real mechanism this lesson has built, unit by
unit, actually closes the real gap it set out to close.

### Discard the Throwaway Example

`LabMatrix` and its own `inverse()` are discarded now — but the exact
real formula and real mechanism they just proved is what `Matrix<Double>`'s
own real, permanent `inverse()` needs, plus one real addition: a guard
against a zero determinant, which this throwaway lab deliberately never
had to consider.

### Project Change

- **Reference Source** — this project's own earlier work's real,
  already-proven `2×2` inverse formula — the identical real computation,
  now given a real, permanent home instead of a throwaway lab.
- **Files affected** —
  `app/src/main/java/com/example/calculator/Matrix.kt`; a new addition
  to the existing
  `app/src/test/java/com/example/calculator/MatrixTest.kt`.
- **Change type** — add.
- **Location** — a new top-level function, added directly after
  `Matrix<Int>.determinant`, the last of the previous unit's own four
  additions.
- **Dependencies** — `Matrix<T>`'s own `rows`, `cols`, and `get`;
  `require`.

### The New Code

```kotlin
fun Matrix<Double>.inverse(): Matrix<Double> {
    require(rows == cols) { "Inverse is only defined for a square matrix" }
    require(rows == 2) { "This project's inverse only supports 2x2 matrices for now" }
    val det = this[0, 0] * this[1, 1] - this[0, 1] * this[1, 0]
    require(det != 0.0) { "Matrix is not invertible: determinant is zero" }
    return Matrix(listOf(
        listOf(this[1, 1] / det, -this[0, 1] / det),
        listOf(-this[1, 0] / det, this[0, 0] / det)
    ))
}
```

### The Updated Project

This is a brand-new, freestanding top-level function, with nothing
surrounding it yet beyond the three other extension functions the
previous unit already added — the block shown above is the entirety of
what this unit adds; there is no larger enclosing structure to return
to.

### Mechanical Walkthrough

- `fun Matrix<Double>.inverse(): Matrix<Double>` — a top-level extension
  function, receiver type `Matrix<Double>` — the exact real mechanism
  proven twice now, once for `Int` in the previous unit, once more here
  for `Double`, confirming it genuinely generalizes to any concrete
  instantiation, not just the one this project happened to need first.
- `require(rows == cols) { "Inverse is only defined for a square matrix" }`
  — the same real `require` already fully documented, the identical
  real square-matrix check `determinant` already uses, restated here
  since `inverse` is a genuinely separate function with its own real
  precondition to state.
- `require(rows == 2) { "This project's inverse only supports 2x2 matrices for now" }`
  — the same real, honest `2×2`-only scope limit `determinant` already
  carries, for the identical real reason: this project has no real,
  shipped need yet for a general, arbitrary-size inverse.
- `val det = this[0, 0] * this[1, 1] - this[0, 1] * this[1, 0]` — the
  identical real `2×2` determinant formula already used throughout this
  project, here computing a real `Double` (since `this[0, 0]` and the
  rest all resolve to `Double` for this specific receiver type) rather
  than an `Int`.
- `require(det != 0.0) { "Matrix is not invertible: determinant is zero" }`
  — a real, new precondition, answering this unit's own Socratic
  prompt: a zero determinant means a real matrix genuinely has no
  inverse at all (not merely one this project declines to compute) —
  `require` refuses outright, with a real, specific message, rather than
  letting the four divisions below silently produce `Infinity` or `NaN`.
- `return Matrix(listOf(listOf(this[1, 1] / det, -this[0, 1] / det), listOf(-this[1, 0] / det, this[0, 0] / det)))`
  — the identical real inverse formula this project's own earlier work
  already proved correct: each of the four real divisions is genuine
  `Double` division (both operands already `Double`, no conversion
  needed this time, since the receiver itself is already
  `Matrix<Double>`), producing a real, correct, fractional result where
  one exists, handed to the same real `Matrix(...)` constructor every
  other real code path in this project already uses.

### CS Lens

A mathematical operation that is only meaningfully defined for some
inputs, and must refuse the rest rather than return a nonsensical
answer, is a real, recurring CS/math idea: a **partial function** —
one whose real domain is smaller than its own declared input type would
suggest. Also recognized in: real division itself, undefined at zero,
in every numeric library that has ever existed; square root, undefined
(over the real numbers) for negative inputs, a real domain check this
project's own earlier scientific-function work already built for
exactly this reason; and file-opening functions across virtually every
real language, which must refuse — not silently succeed — when the
named file genuinely doesn't exist.

### SE Lens

The alternative not chosen here is letting a zero determinant fall
straight through to the four real divisions, producing `Double.POSITIVE_INFINITY`,
`Double.NEGATIVE_INFINITY`, or `Double.NaN` (Kotlin's own real, defined
behavior for floating-point division by zero — unlike `Int` division by
zero, which throws) rather than a clean, real, thrown exception. That
was rejected for the same real reason this project's own earlier
division-by-zero fix and `determinant`'s own square-matrix check both
already established: a `Matrix<Double>` full of `Infinity`/`NaN` values
would compile, print, and pass right through any later code that
doesn't specifically check for those special values, exactly the kind
of confusing, hard-to-trace failure this project's own standing
fail-fast discipline exists to prevent, only worse — floating-point
`NaN`/`Infinity` can silently propagate through further real arithmetic
indefinitely, without ever throwing anything at all. A real, explicit
`require` check, failing immediately and specifically, was the honest,
consistent choice.

### Commands Needed

Already compiled in the same batched pass documented in the first unit.
Run on its own with:

```
$ java -cp labs.jar Lab3_generic_inverseKt
```

This unit's own real project change was verified with a full
`./gradlew testDebugUnitTest assembleDebug` (see the Closing, below,
which covers this lesson's complete, real, final state).

### Run It

```
-0.5 1.5 1.0 -2.0
```

Real, saved at `verification/8.6/lab3_generic_inverse.kt` and
`verification/8.6/lab3_generic_inverse_run.txt`. The real project change
was confirmed via a full, clean `./gradlew testDebugUnitTest assembleDebug`
run, three new tests in `MatrixTest.kt`
(`inverseOfTwoByTwoMatrixIsComputedCorrectly`,
`inverseOfSingularMatrixThrows`, `inverseOfNonSquareMatrixThrows`)
passing alongside this project's full, existing suite.

### Connect the Pieces

`Matrix<T>` gave this project a genuinely reusable shape; the previous
unit proved that shape's own arithmetic could be restored, exactly
where it's actually needed, through extension functions scoped to one
concrete instantiation; this unit used that identical real mechanism a
second time, for a genuinely new type, to finally build the one real
operation this project's own earlier work proved impossible until
today.

## Closing

### Connect the Pieces

One concrete matrix, traced through every real change this lesson
made: `Matrix(listOf(listOf(4.0, 3.0), listOf(2.0, 1.0)))` is now a
real, valid `Matrix<Double>` — buildable at all only because `Matrix<T>`'s
own first-unit rewrite made `T` genuinely fillable with `Double`, not
just `Int`. Calling `.inverse()` on it reaches the third unit's own
real, permanent extension function, computes a real determinant, `-2.0`,
confirms it's nonzero, and returns the real, correct
`Matrix(listOf(listOf(-0.5, 1.5), listOf(1.0, -2.0)))` — the exact same
real numbers this project's own earlier work first proved correct by
hand, now computed by a real, permanent, tested method instead of a
throwaway lab. Meanwhile, this project's own existing `Matrix(listOf(listOf(1, 2), listOf(3, 4)))`-style
`Int` matrices still call `.add`, `.subtract`, `.multiply`, and
`.determinant()` exactly as before — the second unit's own real
extension-function relocation changed where each one lives, never how
any of them behaves. `Matrix.kt` now defines one genuinely generic
class, four real `Matrix<Int>`-scoped operations, and one real
`Matrix<Double>`-scoped one — the identical real shape (a class
declaring its own real capabilities, extension functions adding
type-specific ones back) proven twice, for two genuinely different
concrete types. This project now has 74 real, passing tests — 71
carried over, plus three new ones proving `inverse` correct, refusing a
singular matrix, and refusing a non-square one. Real, verified via a
full `./gradlew testDebugUnitTest assembleDebug` run.

**Next:** Lesson 8.7 puts this entire, now-complete Matrix API — every
real operation this Slice has built — under real, mathematical scrutiny:
testing the actual invariants a correct matrix implementation is
supposed to satisfy, not just individual worked examples.
