# Lesson 8.1: Rows That Don't Have to Match

*2D Data*

- **What you will build.** No application feature lands in this lesson —
  this is a purely diagnostic lesson. Instead, three transferable problems get solved for real,
  each with its own throwaway, compiled, executed Kotlin: how do you even
  *represent* a grid of numbers — rows and columns of them, the shape a
  matrix actually has — using ordinary Kotlin collections? Once you have
  that shape, how do you reach exactly one specific cell inside it, by
  its row and its column? And, once both of those work, is there
  anything about that representation that actually *guarantees* every
  row has the same length — the one property a real mathematical matrix
  must have to be valid? This lesson proves the answer to that third
  question is no, for real, by actually building a broken one that
  compiles and runs without complaint — the exact gap this project's own
  upcoming Matrix Calculator work will have to close.
- **What you need to know first.** Lesson 0.1's `fun main()` entry point
  and `println`; Lesson 0.2's `val` declarations with explicit type
  annotations; Lesson 0.4's `List` and generic type parameters
  (`List<T>`), from "Holding Many Values at Once."

## Terms used in this lesson

- **Generic type parameter** — a placeholder type, written inside angle
  brackets (`<T>`, `<E>`), that a class or function declares instead of
  committing to one concrete type; the real type gets filled in at the
  point of use. This exists so one piece of code — `List`, `listOf` —
  works for a list of `Int`, a list of `String`, or a list of anything
  else, without being rewritten per type.
- **Nested collection** — a collection whose own elements are themselves
  collections, such as `List<List<Int>>`: a list of rows, where each row
  is itself a list of numbers. This exists because a single flat `List`
  has no concept of "row" and "column" — nesting one collection inside
  another is what actually gives numeric data a second dimension.
- **`vararg`** — a parameter modifier telling the compiler that a
  function accepts any number of arguments of the marked type, written
  comma-separated at the call site exactly like separate arguments, and
  packaged internally as an array for the function body to use. This
  exists so a function like `listOf` doesn't force every caller to
  manually wrap their values in an array first, no matter how many
  values they're passing.
- **Operator function** — an ordinary function given one of a small,
  fixed set of special names (`get`, `plus`, `times`, and others) and
  marked with the `operator` keyword, which lets Kotlin call it using
  built-in syntax (`x[i]`, `a + b`) instead of its literal dotted name
  (`x.get(i)`, `a.plus(b)`). This exists so code working with a
  collection or a number can read the way the underlying math or
  everyday notation already reads, instead of forcing every access
  through an explicit method-call spelling.
- **Dimensions (of a matrix)** — the pair of numbers describing a
  rectangular grid's real shape: how many rows it has, and how many
  columns each of those rows has. This is a from-linear-algebra idea,
  not a Kotlin one — it exists because "how big is this matrix" isn't
  one number the way a flat list's `size` is; it's two, and both matter
  independently.
- **Jagged (ragged) list** — a list-of-lists whose inner lists don't all
  share the same length, so it has no single, consistent column count.
  This term exists because a general-purpose language's type system has
  no concept of "matrix" — `List<List<Int>>` is perfectly legal Kotlin
  whether its rows are all the same length or not, and "jagged" is the
  real, standard name for the case where they aren't.

## Objects and methods used

- **`List<E>`**
  - *What it is:* a real Kotlin standard-library interface describing an
    ordered, read-only, positionally-accessible collection of elements.
  - *Implementation:* declared in `kotlin-stdlib-sources.jar`, file
    `commonMain/kotlin/Collections.kt`; the two members this lesson's
    code actually calls are declared, inside that interface, as
    `public operator fun get(index: Int): E` and `public val size: Int`
    (the latter inherited from the parent `Collection<E>` interface it
    extends, and restated on `List` itself).
  - *Its use:* this lesson's entire subject is representing a 2D grid as
    a `List` of `List`s — every other object in this lesson exists to
    build, read, or measure a real `List<E>` instance.
  - *Type:* an interface — a contract with no storage or behavior of its
    own, only declared members every real implementing class must
    provide.
  - *Responsibility:* to guarantee, to any code holding a reference typed
    as `List<E>`, that it can ask for the element at any position from
    `0` up to (but not including) `size`, ask how many elements there
    are in total, and iterate them in a fixed, stable order — regardless
    of which concrete class actually stores the data underneath.
  - *Depends on:* a real, concrete implementing class supplying actual
    backing storage; `List<E>` itself has none — it's a pure contract.
  - *Connects to:* built by `listOf`, which hands back a real object
    satisfying this interface; read by this lesson's own code through
    `get` (via `[]`) and `size`; calls nothing itself, since an interface
    has no body to call anything from.
  - *Shape:* a public, foundational Kotlin stdlib API surface — the
    read-only contract this project (and virtually every Kotlin
    codebase) writes against instead of naming a concrete collection
    class directly.
- **`listOf`**
  - *What it is:* a real, top-level Kotlin standard-library function that
    builds a `List` from whatever arguments are passed to it.
  - *Implementation:* `public fun <T> listOf(vararg elements: T): List<T>`
    — a free function (not a constructor; `List` is an interface and has
    none), confirmed from the real, current source in
    `kotlin-stdlib-sources.jar`, file
    `commonMain/kotlin/collections/Collections.kt`.
  - *Its use:* this is the only way this lesson's code actually creates a
    real `List` instance — once per row, and once more for the outer
    list holding those rows.
  - *Type:* a top-level generic function, not a method on any class.
  - *Responsibility:* to take any number of values of one type and hand
    back one real, immutable `List<T>` object holding exactly those
    values, in the order given.
  - *Depends on:* the `vararg elements` the caller supplies; nothing
    external — no file, no network, no shared state.
  - *Connects to:* called directly by this lesson's own code; hands its
    result back to whatever declared the `val` it's assigned to (in this
    lesson, either a `List<Int>` row or the outer `List<List<Int>>`).
  - *Shape:* a public API surface — the standard, idiomatic entry point
    for building a `List` in Kotlin, reached for instead of any
    particular concrete collection class's own constructor.
- **`size`**
  - *What it is:* a real, read-only property every `List` (by way of the
    `Collection` interface it extends) exposes, reporting how many
    elements it holds.
  - *Implementation:* `public val size: Int`, declared on `Collection<E>`
    in `kotlin-stdlib-sources.jar`, file `commonMain/kotlin/Collections.kt`,
    and restated on `List<E>` itself.
  - *Its use:* this lesson reads it twice — once to confirm how many rows
    a grid has, and once more, per row, to prove two rows can report two
    different lengths.
  - *Type:* an instance property (a `val`, not a function) — read with
    `.size`, no parentheses.
  - *Responsibility:* to report exactly how many elements the specific
    instance it's read from currently holds — nothing about any other
    instance, and nothing about column count when the elements
    themselves happen to be lists.
  - *Depends on:* a real, concrete `List` instance with actual backing
    storage to count; `size` has no meaning apart from one specific
    instance.
  - *Connects to:* read by this lesson's own code (`grid.size`,
    `ragged[0].size`, `ragged[1].size`); implemented, underneath the
    interface, by whatever the real backing storage's own element count
    already is — never recomputed by iterating.
  - *Shape:* a public, read-only property — the "how many" counterpart to
    `get`'s "which one."
- **`get` (operator)**
  - *What it is:* the real Kotlin method that runs whenever this lesson's
    code writes `someList[someIndex]` — square-bracket syntax is not a
    separate feature of `List` itself, it's Kotlin calling this exact
    method.
  - *Implementation:* `public operator fun get(index: Int): E`, declared
    on `List<E>` in `kotlin-stdlib-sources.jar`, file
    `commonMain/kotlin/Collections.kt`, documented there to throw
    `IndexOutOfBoundsException` when `index` is less than zero or
    greater than or equal to `size`.
  - *Its use:* this is the only way this lesson's code reaches one
    specific cell of a grid — first to pick a row, then, applied a
    second time to that row, to pick one number inside it.
  - *Type:* an instance method on `List<E>`, marked `operator` so `[]`
    syntax can call it.
  - *Responsibility:* given one integer position, return the single
    element stored there, or throw a real, specific exception if that
    position doesn't actually exist in this instance.
  - *Depends on:* a real receiver `List` with backing storage, and an
    `index` the caller supplies — `get` has no way to check whether that
    index makes sense for the caller's own intent (row vs. column), only
    whether it's in bounds for this one list.
  - *Connects to:* called by this lesson's own indexing expressions
    (`grid[1]`, and, applied twice, `grid[1][2]`); when the receiver
    itself was built by `listOf`, the value it returns is whatever
    `listOf` stored at that position — for the outer grid, that value is
    itself a `List<Int>`, which is exactly what makes a second `[]`
    possible.
  - *Shape:* a public, per-element read API — the seam where "I have a
    collection" becomes "I have exactly one value out of it."

**Everything else in the file, not this lesson's subject but still explained.**

- **`println`**
  - *What it is:* a real, top-level Kotlin standard-library function that
    writes one line of text to the process's standard output.
  - *Implementation:* `public actual inline fun println(message: Any?)`,
    confirmed from the real, current source in
    `kotlin-stdlib-sources.jar`, file `jvmMain/kotlin/io/Console.kt` —
    on the JVM, its real body is exactly `System.out.println(message)`,
    a direct call into Java's own standard-library output stream, not
    anything Kotlin-specific underneath.
  - *Its use:* every lab in this lesson calls it to make a real value
    show up in this lesson's own saved, real command output, so a
    prediction about that value can be checked against what the running
    program actually produced.
  - *Type:* a top-level function, `println(message: Any?): Unit`.
  - *Responsibility:* convert whatever single value it's given into its
    `String` form and write that, followed by a line break, to standard
    output — nothing about formatting beyond that.
  - *Depends on:* the `message` argument; the JVM process's own standard
    output stream already being open, which it always is for an
    ordinary run.
  - *Connects to:* called directly by this lesson's own code; internally
    calls straight through to `System.out.println`, a real method on a
    real Java class this lesson's code never names directly.
  - *Shape:* a public, foundational stdlib API surface — the everyday
    tool this entire curriculum uses to turn "the code ran" into "here
    is real, readable proof of what it produced."

Every real signature and body quoted above was fetched and confirmed
from the genuine, currently-installed `kotlin-stdlib-sources.jar` this
session, not written from memory. A reader wanting to confirm any of
them independently has two ordinary paths: Kotlin's own official public
API documentation at `kotlinlang.org`, which states each method's real
contract without needing any source browsing at all, or an IDE's
go-to-definition, which opens this exact same stdlib source directly.

## Concept Unit: Nested Collections

### The Problem

A calculator that only ever holds one number at a time — the display's
own current value — has no way to represent a matrix. A matrix isn't one
number; it's a whole grid of them, arranged in rows and columns, where
the position of each number matters as much as its value. Before any
matrix arithmetic can exist, there has to be a real, concrete answer to
a much more basic question: what Kotlin value would you actually assign
to a variable to hold a 2-row, 3-column grid of whole numbers, using
only what this project already knows how to build?

> This project already has `List<Int>` — an ordered
> collection of numbers. Before reading on: could a single `List<Int>`
> represent a full grid on its own, or is one dimension missing from it?
> If a `List<Int>` can hold a *row* of numbers, what real Kotlin value
> could hold a *list of rows* — and what would its declared type have to
> look like? Try writing that type out, on paper or in your head, before
> the next section shows it for real.

### Introduce the Concept in Isolation

A `List<Int>` genuinely can hold one row — `listOf(1, 2, 3)` is already a
real, valid row of three numbers, exactly as already proven true when
this project's own lists were first introduced. What it
cannot do is hold a *second* row alongside the first one; a `List<Int>`
has no concept of "row" at all, only "element." The real answer is to
nest one `List` inside another: a `List` whose own element type is
itself `List<Int>`, so that "one element of the outer list" and "one row
of the grid" mean exactly the same thing.

```kotlin
fun main() {
    val grid: List<List<Int>> = listOf(
        listOf(1, 2, 3),
        listOf(4, 5, 6)
    )
    println(grid)
    println(grid.size)
}
```

Run for real, batch-compiled with this lesson's other two labs via a
single `kotlinc` pass (see Commands Needed, below):

```
[[1, 2, 3], [4, 5, 6]]
2
```

This real, executed output proves two things at once: first, that
`List<List<Int>>` is genuinely legal Kotlin — the compiler accepted a
generic type parameter that is itself another generic type, with no
special syntax beyond nesting the angle brackets; second, that `.size`
on the *outer* list reports `2`, the row count, not `6` — confirming the
outer list's own elements really are being counted as whole rows, each
one opaque to `size` from the outside, not flattened into one long list
of six individual numbers. This is called a **nested collection**.

### Discard the Throwaway Example

This exact `grid` variable, and this exact `main` function, are
discarded now and will not appear again — this lesson stays purely
diagnostic throughout, so nothing here becomes part of the real project
either, but the pattern this lab just proved (nesting `List<List<Int>>`)
is what every later lab and, eventually, this project's own real Matrix
type, will build on.

### Mechanical Walkthrough

Every distinct element of the lab above, in the order it appears:

- `fun main()` — a function declaration with no parameters and no
  declared return type. This is the same entry-point construct this
  entire curriculum has used since its very first program: when this
  file is run, execution begins at the first line inside this function's
  body and proceeds top to bottom. Nothing about this changes when the
  body's own content gets more structurally complex, as it's about to
  here.
- `val grid: List<List<Int>>` — a read-only variable declaration whose
  type is written explicitly rather than left to inference. The explicit
  annotation matters specifically in this
  lab: without it, the declared type would still be correctly inferred
  from the right-hand side, but writing it out makes the nested shape —
  a list of lists of `Int` — visible at the declaration itself, before a
  reader has to parse the right-hand side to discover it.
- `=` — assignment, binding the result of the expression on the right to
  the name `grid` declared on the left. This is ordinary Kotlin
  assignment, unchanged from every earlier use of `val name = ...`.
- `listOf(` *(outer call)* `...)` — a call to the real `listOf` function
  documented above, here invoked with two arguments rather than one.
  Because `listOf` accepts a `vararg`, those two arguments are simply
  written comma-separated, exactly as if `listOf` had been declared with
  two ordinary parameters instead of one variable-length one.
- `listOf(1, 2, 3)` *(first inner call)* — a second, separate call to the
  same real `listOf` function, nested inside the first call's argument
  list. Its three arguments, `1`, `2`, and `3`, are `Int` literals — this
  call returns one real `List<Int>`, which becomes the outer `listOf`
  call's first argument, i.e., `grid`'s first row.
- `listOf(4, 5, 6)` *(second inner call)* — a third, independent call to
  `listOf`, structurally identical to the one just above it but with
  different literal arguments (`4`, `5`, `6`), becoming `grid`'s second
  row. This call is completely separate from the first inner call — it
  builds its own, distinct `List<Int>` instance; nothing links the two
  rows together beyond both being passed to the same outer `listOf` call.
- `println(grid)` *(first call)* — passes the entire `grid` value,
  typed `List<List<Int>>`, to `println`. Because `grid`'s own real
  runtime type has a `toString()` that recursively renders nested lists
  (a `List` implementation's documented contract, not something this
  lesson's code writes itself), the printed text shows both rows,
  bracketed inside the outer brackets, exactly matching the nested
  shape the type declares.
- `grid.size` — a property read on `grid` itself (the *outer* list, not
  either row), returning however many elements the outer list holds —
  here, `2`, because the outer list holds exactly two elements: the two
  rows. This is the same `size` documented above; nothing about reading
  it changes because the elements it's counting happen to be lists
  themselves rather than plain numbers.
- `println(grid.size)` *(second call)* — passes the `Int` result of that
  property read to `println`, printing `2` on its own line, separately
  from the first `println` call's own output.

### CS Lens

A grid represented as nested collections is a real, recognized way to
model two-dimensional data — not an invention specific to this project.
Also recognized in: pixel grids in raw image formats (a row of pixels
per scanline); spreadsheet engines (a row of cells per sheet row); game
boards for grid-based games like chess or tic-tac-toe; seating charts;
and tile-based game maps, where each row of the map is itself a list of
tile identifiers.

### SE Lens

Nesting `List<List<Int>>` was chosen here over a real, genuine
alternative used by some production matrix and image libraries: a
single *flat* `List<Int>` of length `rows × columns`, where a cell's
real position is computed by hand (`row * numColumns + column`) instead
of reached by nested indexing. The flat approach keeps every number in
one contiguous block of memory, which real numeric libraries prefer for
speed — no extra object per row, better memory locality for large
matrices. Nested collections trade that performance away for a real
readability win: `grid[row][col]` reads the same way the row/column
model already does on paper, and the row-list-per-row shape makes an
individual row directly usable as its own `List<Int>` — reachable and
passable to other code — without a slicing calculation first. For the
matrix sizes an actual calculator app displays, that tradeoff favors
readability; a numeric library processing large matrices at scale would
likely make the opposite call.

### Commands Needed

All three of this lesson's labs were compiled together in one real,
batched pass — per this curriculum's own standing Verification Rule,
one `kotlinc` invocation covering every file that needed compiling this
session, rather than one throwaway compile per lab:

```
$ kotlinc lab1_nested_collections.kt lab2_indexing.kt lab3_ragged_dimensions.kt -include-runtime -d labs.jar
```

`kotlinc` is the real Kotlin compiler; `-include-runtime` bundles the
Kotlin standard library into the output `.jar` so it can run standalone
with a plain `java` command; `-d labs.jar` names the output file. Because
each source file declares its own top-level `fun main()`, the compiler
produces one separate, independently runnable class per file — here,
`Lab1_nested_collectionsKt` — rather than one shared entry point, so
each lab can still be run on its own even though all three were compiled
in a single pass. This specific lab was then run with:

```
$ java -cp labs.jar Lab1_nested_collectionsKt
```

### Run It

```
[[1, 2, 3], [4, 5, 6]]
2
```

Real, saved at
`verification/8.1/lab1_nested_collections.kt` and
`verification/8.1/lab1_nested_collections_run.txt`.

### Connect the Pieces

This unit's whole job was answering the lesson's own opening question —
what real Kotlin value can hold a full grid — and `List<List<Int>>`,
just proven real and legal, is that answer; the next unit picks up
exactly where this one's `println(grid)` left off, asking how to reach
one specific number inside that same `grid` instead of printing the
whole thing at once.

## Concept Unit: Indexing

### The Problem

`println(grid)` in the last unit printed the entire grid at once. A real
matrix calculator needs something much more specific: given a row number
and a column number, produce exactly the one value stored there — the
same operation `grid[row][col]` notation already uses on paper in
linear algebra. A plain `List<Int>` already supports single-bracket
indexing, `someList[index]`, proven real earlier in this project's own
life. The real question this unit
answers: does that same bracket syntax work at all on a *nested*
`List<List<Int>>`, and if so, does it take one index or two?

> Given that `grid[0]` on a `List<List<Int>>` would have to return one
> element of the *outer* list — and the outer list's elements are
> themselves `List<Int>`s — what type would `grid[0]` actually have?
> Once you have that value, it's just an ordinary `List<Int>` again —
> what expression, built only from things already proven in this
> lesson's first unit and this project's own earlier work with
> `List<Int>`, would get you one specific number
> out of *that*? Try writing the full expression for "row 1, column 2"
> before reading on.

### Introduce the Concept in Isolation

```kotlin
fun main() {
    val grid: List<List<Int>> = listOf(
        listOf(1, 2, 3),
        listOf(4, 5, 6)
    )
    val secondRow: List<Int> = grid[1]
    val cell: Int = grid[1][2]
    println(secondRow)
    println(cell)
}
```

Run for real, from this lesson's own batched compile:

```
[4, 5, 6]
6
```

This real, executed output proves indexing genuinely does chain: `[1]`
applied once to `grid` — the outer `List<List<Int>>` — really does
return one whole row, `[4, 5, 6]`, typed `List<Int>`, matching the
prediction the Socratic prompt just asked for. Applying `[2]` a second
time, directly to that result, then reaches into *that* row and returns
`6`, a plain `Int` — proving `grid[1][2]` is not one special
two-argument operation at all, but the exact same single-argument
`get` already established for this project's ordinary `List<Int>`
values, applied twice in a row, once per dimension.
This double application is what this lesson calls **indexing** a 2D
structure.

### Discard the Throwaway Example

This lab's `grid`, `secondRow`, and `cell` are discarded now — none of
them becomes part of the real project. What survives is the proof that
`grid[row][col]` really is two ordinary, already-known `get` calls
chained together, with nothing new to learn about `get` itself.

### Mechanical Walkthrough

This unit's new code reuses `grid`'s construction from the previous
unit — reappearing here in full, per this schema's own Repetition Rule,
not skipped as already covered:

- `val grid: List<List<Int>> = listOf(listOf(1, 2, 3), listOf(4, 5, 6))`
  — the identical nested-collection declaration explained in full in the
  previous unit: a read-only `val`, explicitly typed as a list of lists
  of `Int`, built from one outer `listOf` call wrapping two inner
  `listOf` calls, each producing one real row.

The two new elements this unit actually introduces:

- `grid[1]` — an indexing expression on the *outer* list. Written as
  `[1]`, this is Kotlin syntax for a direct call to the real, documented
  `get` operator function above: `grid.get(1)`. Because `grid`'s element
  type is `List<Int>`, this single call returns a whole `List<Int>` —
  specifically, the second row (`[4, 5, 6]`), since `get`'s `index`
  parameter counts from `0`, so `1` names the second element, not the
  first.
- `val secondRow: List<Int> = grid[1]` — a `val` declaration capturing
  that returned row under its own name, explicitly typed `List<Int>` to
  make plain, at the declaration, that indexing the outer list yields
  another list, not a plain number.
- `grid[1][2]` — two chained indexing expressions, each its own separate
  call to `get`, not one combined operation. The first, `grid[1]`, is
  the identical call just explained, returning the row `[4, 5, 6]`. The
  second `[2]`, applied directly to *that returned row* rather than to
  `grid` again, is a second, independent call — `(grid.get(1)).get(2)`
  — this time to the `get` declared on the *inner* `List<Int>`'s own
  interface (still the same `List<E>` interface, just with `E` filled in
  as `Int` here instead of `List<Int>`), returning the `Int` at position
  `2` of that row: `6`.
- `val cell: Int = grid[1][2]` — a `val` declaration capturing that final
  `Int` result, explicitly typed `Int` to match what two chained `get`
  calls, one per dimension, actually produce.
- `println(secondRow)` — passes the captured `List<Int>` to `println`,
  printing `[4, 5, 6]` using the same `List` `toString()` behavior
  already explained in the previous unit.
- `println(cell)` — passes the captured `Int` to `println`, printing
  `6` on its own line.

### CS Lens

Reaching a single element through an operator-syntax call to a
real, named method — `get`, here dressed as `[]` — rather than a bare
memory-offset lookup, is a real, recurring CS idea: **the subscript
operator**. Also recognized in: array indexing in virtually every
mainstream language; dictionary/map lookups (`someDict[key]`); Python's
own `__getitem__` protocol, which is the exact same "operator sugar
calling a real named method" idea under a different name; C++'s
`operator[]`; and spreadsheet cell references, where `A1` notation is
conceptually the same two-coordinate lookup `grid[row][col]` performs
here, just spelled differently.

### SE Lens

The alternative not chosen here is writing every lookup with `get`'s own
literal dotted name — `grid.get(1).get(2)` — instead of `grid[1][2]`.
Kotlin's `operator` mechanism exists specifically so code reading
positional data can look the way the math notation it's modeling already
looks, which is a real readability win once dimensions grow past one.
The real cost, worth stating honestly: bracket syntax visually presents
`grid[1][2]` as one atomic-looking operation, when it is genuinely two
separate calls, each capable of throwing its own
`IndexOutOfBoundsException` independently — a bad *row* index fails
before the column index is ever evaluated at all, and a bad *column*
index only fails after a perfectly valid row was already found. A reader
skimming the bracket syntax without knowing it's sugar for two real
calls could easily misjudge which index caused a real failure.

### Commands Needed

This lab was already compiled in the same batched pass documented in the
previous unit — no separate `kotlinc` invocation was needed. It was run
on its own with:

```
$ java -cp labs.jar Lab2_indexingKt
```

### Run It

```
[4, 5, 6]
6
```

Real, saved at
`verification/8.1/lab2_indexing.kt` and
`verification/8.1/lab2_indexing_run.txt`.

### Connect the Pieces

The previous unit answered "what value holds a whole grid"; this unit
answers "how do I reach one cell of it" — `grid[1][2]`, two chained
calls to the exact same `get` operator, one per dimension. The next unit
puts real pressure on that same `grid[row][col]` shape: is there
anything about it that actually stops the grid from having a different
number of columns in different rows, or has this whole lesson only ever
shown a grid that already happened to be well-formed?

## Concept Unit: Dimensions

### The Problem

Every grid built so far in this lesson has had two rows of exactly three
numbers each — a real 2×3 matrix. Nothing about that was verified; it
was simply written that way. A real matrix's **dimensions** — its row
count and its column count — are not incidental facts about it; they're
part of what makes it a valid matrix at all, and matrix arithmetic (an
upcoming feature this project will build) depends on both matrices in an
operation actually agreeing on shape. The real question: does
`List<List<Int>>`, exactly as used so far, do anything at all to enforce
that every row has the same length?

> `List<List<Int>>` is really just "a list, whose element type happens
> to be another list." Nothing in that description says anything about
> the *lengths* of those inner lists matching each other. Given that,
> would you expect Kotlin's compiler to reject a `List<List<Int>>` whose
> rows have different lengths — or would you expect it to compile
> without complaint? What would `someRow.size` report for each row of
> such a grid, and would anything reading only `grid.size` (the outer
> list's own row count) ever notice a problem?

### Introduce the Concept in Isolation

```kotlin
fun main() {
    val ragged: List<List<Int>> = listOf(
        listOf(1, 2, 3),
        listOf(4, 5)
    )
    println(ragged)
    println(ragged[0].size)
    println(ragged[1].size)
}
```

Run for real, from this lesson's own batched compile:

```
[[1, 2, 3], [4, 5]]
3
2
```

This real, executed output proves the real answer: this compiles
without a single warning or error, and runs to completion, even though
its second row genuinely has one fewer element than its first. `.size`,
read per row, reports the real, different lengths honestly — `3`, then
`2` — with nothing in that output, or in the compiler's own acceptance
of the code, flagging that a grid built this way could never actually
represent a valid mathematical matrix. This is called a **jagged
list** — one whose rows don't all share the same length — and the real
finding here is that Kotlin's type system, and `List<List<Int>>` as a
representation, cannot tell a jagged list apart from a well-formed one
at all; both are, to the compiler, just a `List<List<Int>>`.

### Discard the Throwaway Example

This lab's `ragged` variable is discarded now and will not reappear —
but the real gap it just proved does not go away with it: any future
code in this project that builds a grid using bare `List<List<Int>>`,
the way every lab in this lesson has, inherits this exact same gap.

### Mechanical Walkthrough

- `val ragged: List<List<Int>> = listOf(listOf(1, 2, 3), listOf(4, 5))`
  — the same nested-collection declaration pattern fully explained in
  the first unit: a read-only, explicitly-typed `val`, built from one
  outer `listOf` call wrapping two inner `listOf` calls. The only real
  difference from every earlier grid in this lesson is the second inner
  call's own argument count — two arguments, `4` and `5`, instead of
  three — which is all it actually takes to make the two rows different
  lengths; nothing about the outer `listOf` call, or the declared type
  `List<List<Int>>`, changes to accommodate that at all.
- `println(ragged)` — passes the whole nested value to `println`, using
  the same recursive `List` `toString()` behavior already explained,
  printing both rows exactly as stored, mismatched lengths and all.
- `ragged[0].size` — first, `ragged[0]`, the same indexing operation
  fully explained in the previous unit — a single call to `get`,
  returning the first row, `[1, 2, 3]`, typed `List<Int>`. Then `.size`,
  the same property already explained, read on *that specific row*
  rather than on the outer list — reporting `3`, the real element count
  of this one row, independent of any other row.
- `ragged[1].size` — the identical pattern applied to the second row:
  `ragged[1]` returns `[4, 5]`, and `.size` on that specific row reports
  `2` — a real, different number from the previous line's `3`, read from
  a completely independent property access with no relationship enforced
  between the two.
- `println(ragged[0].size)` and `println(ragged[1].size)` — two separate
  calls to `println`, each passed one of the two `Int` results just
  described, printing them on their own lines, in the order the code
  calls them.

### CS Lens

A property that real data is supposed to satisfy, but that a type alone
does not enforce, is a real, recurring CS idea: an **invariant** —
specifically, one the type system leaves unchecked, meaning it can only
be guaranteed by code that deliberately validates it. Also recognized
in: a sorted list's own "always in order" property, which no `List`
type enforces on its own; a balanced binary search tree's height and
coloring rules; a database's referential-integrity constraints, which
exist precisely because a foreign-key column's own type (an integer)
says nothing about whether the row it points to actually exists; and
design-by-contract class invariants generally, which exist for the same
reason this lesson's `List<List<Int>>` gap does — a type describes
*shape*, not every *rule* the data is actually supposed to follow.

### SE Lens

The alternative to leaving this gap open is validating it — checking,
at the moment a matrix-like value is actually constructed, that every
row really does have the same length, and refusing to build the value
at all if they don't. That check is deliberately not written in this
lesson: nothing here builds a real, permanent type, only throwaway labs
proving the gap exists. The real tradeoff a future, permanent Matrix
type in this project will have to make explicitly: validate dimensions
once, at construction, and fail loudly and immediately if they're wrong
(the "fail fast" principle) — versus trusting every single piece of code
that ever builds a `List<List<Int>>` to get it right by convention,
forever, with a malformed grid otherwise surfacing as a confusing,
hard-to-trace failure far away from wherever it was actually built. This
lesson's own real, executed lab already shows the cost of the second
option: a jagged list compiles, runs, and prints seemingly reasonable
output, with nothing about it looking obviously broken until something
downstream — real matrix addition, for instance, walking both matrices'
rows in lockstep — actually depends on every row matching.

### Commands Needed

This lab, too, was already compiled in the same batched pass documented
in the first unit. It was run on its own with:

```
$ java -cp labs.jar Lab3_ragged_dimensionsKt
```

### Run It

```
[[1, 2, 3], [4, 5]]
3
2
```

Real, saved at
`verification/8.1/lab3_ragged_dimensions.kt` and
`verification/8.1/lab3_ragged_dimensions_run.txt`.

### Connect the Pieces

The previous unit proved `grid[row][col]` reliably reaches one real
cell; this unit proves that reliability is quietly conditional — it only
works correctly if every row actually has the matching column count that
`grid[row][col]`-style code silently assumes, and nothing about
`List<List<Int>>` itself, as used throughout this entire lesson, checks
that assumption anywhere.

## Closing

### Connect the Pieces

One concrete grid, traced through all three units built in this lesson:
the first unit proved `List<List<Int>>` — `listOf(listOf(1, 2, 3),
listOf(4, 5, 6))` — is a real, legal way to hold a 2-row, 3-column grid
of numbers, with the outer list's own `size` correctly reporting `2`
rows. The second unit reached into that exact same grid, `grid[1][2]`,
and got back `6` — the number sitting at row 1, column 2 — by chaining
the same single-index `get` operation twice, once per dimension, with
nothing special about the double brackets beyond that. The third unit
took that same shape and deliberately broke the one property the first
two units had quietly been relying on the whole time: it built a grid
whose rows didn't match — `[1, 2, 3]` next to `[4, 5]` — and Kotlin
accepted it exactly as readily as the well-formed grid, with `ragged[0].size`
and `ragged[1].size` honestly reporting two different numbers and
nothing else objecting anywhere. A grid can be built, and indexed into,
using nothing more than what this lesson just proved — but nothing this
lesson proved actually guarantees the grid it built was ever a valid
matrix to begin with.

**Next:** Lesson 8.2 builds this project's own first real Matrix API —
the permanent type whose job is closing exactly the gap this lesson's
third unit just proved is real.

