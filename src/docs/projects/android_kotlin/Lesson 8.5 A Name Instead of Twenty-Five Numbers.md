# Lesson 8.5: A Name Instead of Twenty-Five Numbers

*Factory Pattern*

- **What you will build.** A real, permanent way to build one specific,
  well-known kind of matrix — an identity matrix — by name,
  `Matrix.identity(size)`, instead of typing out every one of its
  cells by hand. Along the way, this lesson investigates BRD's own
  explicit, conditional question — does building matrices this way
  genuinely benefit from a real Factory pattern at all, or would that be
  real, unneeded complexity — and lands on a specific, minimal, real
  answer: yes, but only in Kotlin's own simplest form.
- **What you need to know first.** This lesson's own three direct
  predecessors — `Matrix`'s real constructor, `rows`, `cols`, and
  `multiply`; Lesson 0.6's own classes and constructors.

## Terms used in this lesson

- **Factory pattern** — a real, named object-oriented design pattern:
  instead of a caller building an object directly with its own
  constructor, a separate function — a "factory" — builds it instead,
  usually under a name that describes *what* is being built rather than
  *how*. This exists because some real objects are more naturally
  described by a known configuration ("an identity matrix of size 3")
  than by the raw values that configuration happens to produce, and
  because hiding the construction details behind a name means those
  details can change later without the caller ever needing to know.
- **`companion object`** — a real, single, automatically-created object
  attached to a class itself, rather than to any instance of it. This
  exists because Kotlin has no `static` keyword the way Java does —
  anything that needs to belong to a class as a whole, reachable without
  ever creating an instance first, is declared inside a `companion
  object` block instead, and Kotlin lets it be called using the
  enclosing class's own name directly (`Matrix.identity(...)`, not
  `Matrix.Companion.identity(...)`).
- **`private constructor`** — a class's own primary constructor, marked
  `private`, meaning only code already inside that same class (including
  its own `companion object`) can call it directly; any other code is
  compiler-refused. This exists so a class's own author can force every
  outside caller through a specific, named path — a factory function —
  rather than leaving the plain constructor open as a second, competing
  way to build the same kind of object.

## Objects and methods used

- **`Matrix.identity`**
  - *What it is:* this lesson's own new, permanent, real factory
    function — this entire lesson's own real subject.
  - *Implementation:* `fun identity(size: Int): Matrix`, declared inside
    `Matrix`'s own new `companion object` block, returning
    `Matrix((0 until size).map { r -> (0 until size).map { c -> if (r == c) 1 else 0 } })`
    — a real `size × size` grid, `1` wherever the row and column index
    are equal (the main diagonal), `0` everywhere else.
  - *Its use:* the real, concrete reason this lesson exists — a caller
    that needs a real identity matrix no longer has to write out its
    cells by hand, for any size.
  - *Type:* a function declared inside a `companion object`, callable as
    `Matrix.identity(...)` without ever constructing a `Matrix` first.
  - *Responsibility:* to build and return one real, correct identity
    matrix of exactly the requested size — never anything about what a
    caller does with it afterward.
  - *Depends on:* the requested `size`; `Matrix`'s own already-real
    constructor, `until`, and `map`, all already established.
  - *Connects to:* called directly by this lesson's own real test code;
    internally calls the identical real `Matrix(...)` constructor every
    other real code path in this project already uses — `identity`
    builds ordinary data and hands it to the same real constructor,
    it does not bypass `Matrix`'s own real validation.
  - *Shape:* a public, permanent domain API surface — a real, named,
    convenience entry point sitting alongside `Matrix`'s own plain
    constructor, not replacing it.
- **`until`**
  - *What it is:* the real, infix Kotlin standard-library function,
    already fully documented in this lesson's own predecessors, building
    a range of consecutive integers.
  - *Implementation:* `public infix fun Int.until(to: Int): IntRange` —
    unchanged from its own already-confirmed real signature.
  - *Its use:* `Matrix.identity` uses it exactly as every other real
    `Matrix` operation already does, to name every valid row and column
    position for the requested size.
  - *Type:* an infix extension function on `Int`.
  - *Responsibility:* unchanged — to produce one real `IntRange`
    representing every integer from its start up to, but not including,
    its end.
  - *Depends on:* unchanged — the `Int` receiver (start) and the `to`
    argument (exclusive end).
  - *Connects to:* called directly by `Matrix.identity`; its result is
    handed to `map`, below.
  - *Shape:* unchanged — a public stdlib API surface.
- **`map`**
  - *What it is:* the real Kotlin standard-library function, already
    fully documented in this lesson's own predecessors, building a new
    list by transforming every element of an existing collection.
  - *Implementation:* `public inline fun <T, R> Iterable<T>.map(transform: (T) -> R): List<R>`
    — unchanged from its own already-confirmed real signature.
  - *Its use:* `Matrix.identity` uses the same real nested
    `map`-over-`until` shape every other `Matrix` operation already
    uses, here deciding each cell's own value (`1` or `0`) instead of
    combining two existing matrices.
  - *Type:* a generic, inline extension function on `Iterable<T>`.
  - *Responsibility:* unchanged — to produce exactly one new output
    element per input element, in order.
  - *Depends on:* unchanged — the receiver collection and a `transform`
    function.
  - *Connects to:* called on a range from `until`, nested inside itself,
    inside `Matrix.identity`.
  - *Shape:* unchanged — a public, foundational stdlib API surface.

## Concept Unit: A Factory Method, Not a Factory Class

### The Problem

An identity matrix — `1`s down its main diagonal, `0`s everywhere
else — is one of the most common real matrices in linear algebra,
already directly relevant to this project's own real, upcoming
mathematical-testing work. Building one today means writing out every
single cell of it by hand: for a `5×5` identity matrix, that's `25`
numbers, `20` of them `0` and `5` of them `1`, typed out in exactly the
right positions, every single time one is needed. BRD's own plan poses
this as a real, open question, not a foregone conclusion: does building
matrices this way genuinely benefit from a real Factory pattern, or
would introducing one be unneeded complexity for a problem a plain
constructor already handles well enough?

> A "Factory pattern," at its most general, just means "a function
> builds the object instead of a caller calling a constructor directly."
> Given that `Matrix`'s own constructor already exists and already
> works, what would a real factory function actually add on top of it —
> not in the abstract, but for this one, specific, extremely common
> case? And given that Kotlin has no `static` keyword the way Java does,
> what real Kotlin construct would let a function be called directly on
> `Matrix` itself — `Matrix.identity(3)` — without ever writing
> `Matrix(...)` first?

### Introduce the Concept in Isolation

```kotlin
class LabShape private constructor(val sides: Int, val sideLength: Int) {
    companion object {
        fun square(sideLength: Int): LabShape = LabShape(4, sideLength)
        fun triangle(sideLength: Int): LabShape = LabShape(3, sideLength)
    }
}

fun main() {
    val s = LabShape.square(5)
    println("${s.sides} sides, length ${s.sideLength}")
    val t = LabShape.triangle(5)
    println("${t.sides} sides, length ${t.sideLength}")
}
```

Run for real, batch-compiled with this lesson's own break case via a
single `kotlinc` pass (see Commands Needed, below):

```
4 sides, length 5
3 sides, length 5
```

This real, executed output proves the real mechanism: `LabShape.square(5)`
and `LabShape.triangle(5)` are both called directly on `LabShape`
itself — no `LabShape(...)` anywhere in `main` — yet each one hands back
a real, correctly-shaped `LabShape` instance, `4 sides` for one, `3` for
the other, both built from the exact same real, private constructor
underneath. This is called a **`companion object`**: a real, single
object, automatically attached to `LabShape` itself, whose own members
(`square`, `triangle`) are reachable through the class's own name.

A second, real, negative-case compile proves the constructor really is
locked:

```kotlin
class LabShape private constructor(val sides: Int, val sideLength: Int) {
    companion object {
        fun square(sideLength: Int): LabShape = LabShape(4, sideLength)
    }
}

fun main() {
    val direct = LabShape(4, 5)
    println(direct.sides)
}
```

```
break1_private_constructor.kt:8:18: error: cannot access 'constructor(sides: Int, sideLength: Int): LabShape': it is private in 'LabShape'.
    val direct = LabShape(4, 5)
                 ^^^^^^^^
```

This real, genuine compile error — not a guess about what `private`
"probably" does — proves a **`private constructor`** really does refuse
every caller outside the class itself, including an ordinary `main`
function in the very same file that declares it; only code already
inside `LabShape` (its own `companion object` included) can call it.

### Discard the Throwaway Example

`LabShape` — both its working version and its deliberately broken
one — is discarded now — but the real, proven mechanism (a
`companion object` holding named factory functions, reachable through
the class's own name) is exactly what `Matrix.identity` needs.

### Project Change

- **Reference Source** — no reference counterpart; a from-scratch
  addition, matching how this project's own earlier, similar features
  (like `Matrix` itself) were built.
- **Files affected** —
  `app/src/main/java/com/example/calculator/Matrix.kt`; a new test
  addition to the existing
  `app/src/test/java/com/example/calculator/MatrixTest.kt`.
- **Change type** — add.
- **Location** — a new `companion object` block, added inside `Matrix`,
  directly after `determinant`, the last method before `Matrix`'s own
  closing brace.
- **Dependencies** — `Matrix`'s own already-real constructor, `until`,
  and `map`.

### The New Code

```kotlin
companion object {
    fun identity(size: Int): Matrix {
        return Matrix((0 until size).map { r -> (0 until size).map { c -> if (r == c) 1 else 0 } })
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
13:    fun add(other: Matrix): Matrix = MatrixAddition.apply(this, other)
14:
15:    fun subtract(other: Matrix): Matrix {
16:        require(rows == other.rows && cols == other.cols) {
17:            "Matrices must have the same dimensions to subtract"
18:        }
19:        return Matrix((0 until rows).map { r -> (0 until cols).map { c -> this[r, c] - other[r, c] } })
20:    }
21:
22:    fun multiply(other: Matrix): Matrix = MatrixMultiplication.apply(this, other)
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
33:
34:    companion object { // ← new
35:        fun identity(size: Int): Matrix { // ← new
36:            return Matrix((0 until size).map { r -> (0 until size).map { c -> if (r == c) 1 else 0 } }) // ← new
37:        } // ← new
38:    } // ← new
39: }
```

`Matrix` now has a real, permanent, named way to build one of the most
common real matrices in linear algebra, alongside its own plain,
still-fully-public constructor — `identity(3)` reads, at the call site,
exactly like what it builds, rather than a caller needing to reconstruct
"nine numbers, six of them zero, three of them one, in exactly these
positions" from memory every time.

### Mechanical Walkthrough

- `companion object { ... }` — a `companion object` block, the real
  construct proven in isolation above, declared with no name of its own
  (the default, unnamed form — Kotlin still lets its members be reached
  through `Matrix`'s own name directly, exactly as proven for
  `LabShape`).
- `fun identity(size: Int): Matrix` — a function declaration inside that
  block, taking one `Int` parameter (the requested size) and returning a
  real `Matrix`.
- `return Matrix((0 until size).map { r -> (0 until size).map { c -> if (r == c) 1 else 0 } })`
  — the same real nested `until`/`map` shape every other `Matrix`
  operation already uses, but deciding each cell's value from `r` and
  `c` themselves rather than reading from an existing matrix: `if (r == c) 1 else 0`
  — a real Kotlin `if`/`else` *expression* (the same pattern `Matrix`'s
  own `cols` property already uses), producing `1` exactly when the row
  index equals the column index (the main diagonal) and `0` everywhere
  else. The resulting `List<List<Int>>` is handed to the identical real
  `Matrix(...)` constructor every other real code path in this project
  already uses — `identity` builds ordinary data, then goes through
  exactly the same real validation (`init`'s own `require`) as any other
  `Matrix`.

### CS Lens

Naming a well-known configuration instead of describing its raw values
is a real, recurring CS/SE idea, the **Factory pattern**. Also
recognized in: `Color.RED`-style named constants in many real UI
libraries, hiding a specific RGB value behind an intention-revealing
name; date/time libraries offering `LocalDate.now()` or `Duration.ofSeconds(30)`
instead of requiring a caller to assemble the equivalent raw fields by
hand; and, in mathematics generally, well-known special matrices beyond
the identity — a zero matrix, a matrix of all ones — every one of them a
real, nameable configuration a factory function could equally build.

### SE Lens

The alternative not chosen here is a heavier, class-based Factory —
a real, separate `MatrixFactory` type, instantiated on its own, with
`identity`/`zeros`/other-shaped methods as real instance methods rather
than a `companion object`'s. That alternative genuinely exists in real
object-oriented design, and is the right real choice specifically when
*which* concrete factory to use needs to be decided at runtime — a
plugin system choosing between several real, swappable factory
implementations, for instance, the same real motivation the Strategy
pattern already served for `add`/`multiply`. Nothing about building an
identity matrix has that shape: every caller already knows, at the
point it writes `Matrix.identity(3)`, exactly what it wants — there is
no real runtime decision between competing factory implementations to
make. BRD's own explicit, conditional framing ("only if dynamic matrix
creation genuinely benefits from it") is answered honestly here: a
heavier class-based Factory would be real, unneeded complexity for this
project's own real, current need; Kotlin's own simplest real form of the
same underlying idea — a named function, reachable without an instance,
via `companion object` — is the one this project's own real need
actually justifies. **A real, deliberate scope limit, recorded
honestly**: only `identity` was built, not a `zeros`(all-zero matrix) or
other special-matrix factory alongside it — nothing in this project's
own real, current plans needs one yet; the same real `companion object`
shape already proven here is exactly how a future one would be added,
the moment a real need for it actually exists, matching this project's
own standing "nothing built speculatively" discipline.

### Commands Needed

This unit's two labs (the working version and the deliberately broken
one) were compiled separately, since one is meant to fail:

```
$ kotlinc lab1_companion_factory.kt -include-runtime -d lab1.jar
$ java -jar lab1.jar
```

```
$ kotlinc break1_private_constructor.kt -include-runtime -d break1.jar
```

(the second command's own non-zero exit and printed error are the real,
expected result, not a failure of this lesson's own process). This
unit's real project change was verified with a full
`./gradlew testDebugUnitTest assembleDebug` run.

### Run It

```
4 sides, length 5
3 sides, length 5
```

Real, saved at `verification/8.5/lab1_companion_factory.kt` and
`verification/8.5/lab1_companion_factory_run.txt`; the real, negative
compile at `verification/8.5/break1_private_constructor.kt` and
`verification/8.5/break1_private_constructor_run.txt`. The real project
change was confirmed via a full, clean `./gradlew testDebugUnitTest assembleDebug`
run, two new tests in `MatrixTest.kt`
(`identityOfSizeTwoHasOnesOnDiagonal`, `identityOfSizeThreeHasOnesOnDiagonal`)
passing alongside this project's full, existing suite.

### Connect the Pieces

This lesson's own real, investigated conclusion — a `companion object`
factory function, not a heavier Factory class — closes BRD's own
explicit, conditional question with a real, specific answer:
`Matrix.identity(size)` now exists, callable without ever writing
`Matrix(...)` directly, built entirely from tools this project already
had.

## Closing

### Connect the Pieces

One concrete call, traced start to finish: `Matrix.identity(3)` reaches
`Matrix`'s own new `companion object`, without any `Matrix` instance
existing yet to call it on — proven possible, in isolation, by
`LabShape.square(5)`'s own identical real mechanism, and proven refused
when attempted the wrong way, by `LabShape(4, 5)`'s own real, caught
compile error. Inside `identity`, the same real `(0 until size).map { r -> (0 until size).map { c -> ... } }`
shape every other `Matrix` operation already uses builds a real
`List<List<Int>>` — `1` at every position where `r` equals `c`, `0`
everywhere else — and hands it to `Matrix`'s own ordinary, still fully
public constructor, which validates it exactly like any other `Matrix`,
producing the real
`Matrix(listOf(listOf(1, 0, 0), listOf(0, 1, 0), listOf(0, 0, 1)))`. This
project now has 71 real, passing tests — 69 carried over, plus two new
ones in `MatrixTest.kt` confirming `identity` builds the real, correct
diagonal for two different sizes. Real, verified via a full
`./gradlew testDebugUnitTest assembleDebug` run.

**Next:** Lesson 8.6 turns to generics — the real, motivating trigger
being the `Inverse` operation this project's own earlier work already
proved cannot exist correctly until `Matrix` can hold something other
than `Int`.
