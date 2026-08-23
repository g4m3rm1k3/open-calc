# Lesson 8.3: Eight Times Instead of Four

*Algorithm Complexity*

- **What you will build.** No application feature lands in this lesson —
  this is a purely diagnostic lesson, matching the shape this project's
  own earlier complexity work already established. Instead, one real
  question gets answered with real, counted evidence: `Matrix`'s five
  real operations don't all cost the same to run, and this lesson proves,
  concretely, which ones scale together and which one scales
  differently — and, for the one that scales differently, by exactly how
  much.
- **What you need to know first.** This lesson's own two direct
  predecessors — `Matrix`'s real `add`, `subtract`, `multiply`,
  `transpose`, and `determinant`, and the nested `(0 until n).map { ... }`
  pattern every one of them is built from; this project's own earlier
  complexity work, which already proved real, counted, or timed evidence
  for constant, linear, quadratic, logarithmic, and log-linear growth,
  using this project's own real code as the evidence.

## Terms used in this lesson

- **Big-O notation** — a way of naming how the real *amount of work* an
  algorithm does grows as its input grows, using the dominant term only
  and ignoring constant factors — `O(n²)` means "roughly proportional to
  the square of the input size," regardless of exactly how large the
  constant multiplying that square actually is. This exists because two
  algorithms can both be "correct" while behaving completely differently
  as real input grows, and a plain description of what code does says
  nothing about which one that is.
- **Quadratic time — `O(n²)`** — work that grows proportional to the
  square of the input size: doubling the input roughly quadruples the
  real work. This project's own earlier complexity work already proved
  this real growth rate exists in code it had already shipped; this
  lesson checks whether it also describes `Matrix`'s own new operations.
- **Cubic time — `O(n³)`** — work that grows proportional to the *cube*
  of the input size: doubling the input roughly multiplies the real work
  by eight (`2³`). This term is new to this project — nothing this
  project has shipped before `Matrix`'s own `multiply` has needed it.
- **`for`/`in` loop** — a real Kotlin control-flow construct that runs
  its body once per element of whatever collection or range follows
  `in`, without the reader ever manually incrementing an index. This
  exists so "do this once per element" can be written directly, without
  the bookkeeping a manual counter and a `while` loop would otherwise
  need.
- **`var`** — a mutable variable declaration, in contrast to the
  read-only `val` this project's own code overwhelmingly prefers
  elsewhere. This exists because counting real operations as they happen
  genuinely requires a value that changes over time — a running total —
  which a `val`, by definition, cannot be.

## Objects and methods used

- **`Matrix`'s `add`, `subtract`, `multiply`, `transpose`, `determinant`**
  - *What it is:* this project's own five real, permanent operations,
    already fully built in this lesson's immediate predecessor — this
    entire lesson's own real subject. No code in this lesson calls any
    of them directly (every lab, below, is a deliberately independent,
    throwaway reimplementation of the same real shape, per the Concept
    Isolation Rule); this lesson exists to measure the real cost of the
    shapes they already established.
  - *Implementation:* `add`/`subtract`/`multiply` each take one
    `other: Matrix` parameter and return a `Matrix`; `transpose` and
    `determinant` take none, returning a `Matrix` and an `Int`
    respectively — all five already shown in full, as real, permanent
    project code, in this lesson's immediate predecessor.
  - *Its use:* the real reason this lesson exists — to determine, with
    real, counted evidence, which of these five share one real growth
    rate and which one doesn't.
  - *Type:* five separate instance methods on `Matrix`.
  - *Responsibility:* unchanged from this lesson's immediate
    predecessor — `add`/`subtract` combine two same-shaped matrices
    cell by cell; `multiply` combines two compatibly-shaped matrices via
    a real dot product per result cell; `transpose` reshapes one matrix;
    `determinant` reduces one square matrix to a single number.
  - *Depends on:* unchanged from this lesson's immediate predecessor.
  - *Connects to:* unchanged from this lesson's immediate predecessor;
    this lesson's own labs connect to them only by *shape* — each lab's
    own nested `map`-over-`until` (and, for the second lab, `sumOf`)
    structure is a faithful, independently-built copy of one real
    method's own already-established body, not a call to it.
  - *Shape:* unchanged from this lesson's immediate predecessor — a
    public API surface, this project's own real Matrix Calculator
    feature.
- **`listOf`**
  - *What it is:* the real, top-level Kotlin standard-library function,
    already fully documented in this lesson's own immediate predecessor,
    that builds a `List` from whatever arguments are passed to it.
  - *Implementation:* `public fun <T> listOf(vararg elements: T): List<T>`
    — unchanged from its own already-confirmed real signature.
  - *Its use:* this lesson's own labs use it once each, to name the exact
    sequence of matrix sizes — `2`, `4`, `8`, `16` — being measured.
  - *Type:* a top-level generic function.
  - *Responsibility:* to take any number of values and hand back one
    real, immutable `List` holding exactly those values, in order.
  - *Depends on:* the `vararg elements` supplied at the call site.
  - *Connects to:* called directly by this lesson's own lab code; its
    result is immediately handed to a `for`/`in` loop, below, rather than
    `map`, since each size in this lesson needs a full, separate
    printed line as a real side effect, not a transformed value to
    collect.
  - *Shape:* a public stdlib API surface — the same, already-established
    entry point for building a `List` this project has used since its
    very first lists.
- **`until`**
  - *What it is:* the real, infix Kotlin standard-library function,
    already fully documented in this lesson's own immediate predecessor,
    building a range of consecutive integers.
  - *Implementation:* `public infix fun Int.until(to: Int): IntRange` —
    unchanged from its own already-confirmed real signature.
  - *Its use:* every one of this lesson's own labs uses it, exactly as
    `Matrix`'s own real operations already do, to name "every valid row
    position" and "every valid column position" for a grid of a given
    size.
  - *Type:* an infix extension function on `Int`.
  - *Responsibility:* to produce one real `IntRange` representing every
    integer from its start up to, but not including, its end.
  - *Depends on:* the `Int` receiver (start) and the `to` argument
    (exclusive end).
  - *Connects to:* called directly by this lesson's own lab code; its
    result is immediately handed to `map`, below.
  - *Shape:* a public stdlib API surface — unchanged from its own
    already-established role in this project.
- **`map`**
  - *What it is:* the real Kotlin standard-library function, already
    fully documented in this lesson's own immediate predecessor,
    building a new list by applying a transformation to every element of
    an existing collection.
  - *Implementation:* `public inline fun <T, R> Iterable<T>.map(transform: (T) -> R): List<R>`
    — unchanged from its own already-confirmed real signature.
  - *Its use:* both of this lesson's own labs reuse the identical, nested
    `map`-over-`until` shape `Matrix`'s own real operations already use
    to build a same-sized grid to measure against — the exact real
    structure being measured, reused rather than invented fresh, so the
    thing being counted is genuinely representative of `Matrix`'s own
    real code.
  - *Type:* a generic, inline extension function on `Iterable<T>`.
  - *Responsibility:* to produce exactly one new output element per input
    element, in order.
  - *Depends on:* the receiver collection and a `transform` function.
  - *Connects to:* called on ranges from `until`, nested inside itself,
    exactly as already established.
  - *Shape:* a public, foundational stdlib API surface — unchanged from
    its own already-established role in this project.
- **`sumOf`**
  - *What it is:* the real Kotlin standard-library function, already
    fully documented in this lesson's own immediate predecessor, adding
    up a number computed from every element of a collection into one
    total.
  - *Implementation:* `public inline fun <T> Iterable<T>.sumOf(selector: (T) -> Int): Int`
    — unchanged from its own already-confirmed real signature.
  - *Its use:* this lesson's own second lab reuses it, exactly as
    `Matrix.multiply` already does, as the innermost step being measured
    — each call to its own `selector` lambda is one real multiplication
    this lesson counts.
  - *Type:* a generic, inline extension function on `Iterable<T>`.
  - *Responsibility:* to compute one running total by calling `selector`
    once per element and adding each result.
  - *Depends on:* the receiver collection and a `selector` function.
  - *Connects to:* called on a range from `until`, exactly as already
    established; its own `selector` lambda, in this lesson's own lab, is
    where the real counting happens.
  - *Shape:* a public stdlib API surface — unchanged from its own
    already-established role in this project.

**Everything else in the file, not this lesson's subject but still explained.**

- **`println`**
  - *What it is:* the real, top-level Kotlin standard-library function,
    already fully documented earlier in this project, writing one line
    of text to standard output.
  - *Implementation:* `public actual inline fun println(message: Any?)`
    — unchanged from its own already-confirmed real body, a direct call
    into Java's own `System.out.println`.
  - *Its use:* both of this lesson's own labs use it to print one real,
    labeled line per matrix size measured, so every real count this
    lesson claims is visible in its own saved output, not just asserted.
  - *Type:* a top-level function.
  - *Responsibility:* convert its argument to a `String` and write it,
    followed by a line break, to standard output.
  - *Depends on:* the `message` argument; the process's own open
    standard-output stream.
  - *Connects to:* called directly by this lesson's own lab code, once
    per loop iteration.
  - *Shape:* a public, foundational stdlib API surface — unchanged from
    its own already-established role throughout this curriculum.

Every real signature quoted above was already fetched and confirmed from
the genuine, currently-installed `kotlin-stdlib-sources.jar` in this
lesson's own immediate predecessor; restated here, in full, per this
schema's own Repetition Rule, rather than assumed unchanged without
re-stating it.

## Concept Unit: The Quadratic Family — Add, Subtract, Transpose

### The Problem

`Matrix` has three real operations — `add`, `subtract`, `transpose` —
that all share the identical real shape: a single, nested
`(0 until rows).map { r -> (0 until cols).map { c -> ... } }` (or the
column-outer variant `transpose` uses), doing one small, fixed amount of
work per cell. For a square matrix of size `n` — `n` rows, `n`
columns — how does the real, total amount of work these three
operations do actually grow as `n` grows? Does it grow the same way this
project's own earlier complexity work already proved for its own
already-shipped, unrelated code?

> This project's own earlier complexity work already proved a real
> growth rate for code that visits every cell of an `n`-sized structure
> exactly once, doing one fixed amount of work per cell. Given that
> `add`'s own nested `map`-over-`until` shape visits every one of a
> square matrix's own `n × n` cells exactly once, what real growth rate
> would you predict for it, before running anything? If `n` doubles,
> would you expect the real number of cells visited to double as well,
> or to grow by some other real factor?

### Introduce the Concept in Isolation

```kotlin
var cellVisitCount = 0

fun countedCombine(size: Int): List<List<Int>> {
    cellVisitCount = 0
    val a = (0 until size).map { r -> (0 until size).map { c -> r * size + c } }
    val b = (0 until size).map { r -> (0 until size).map { c -> r * size + c } }
    return (0 until size).map { r ->
        (0 until size).map { c ->
            cellVisitCount++
            a[r][c] + b[r][c]
        }
    }
}

fun main() {
    for (size in listOf(2, 4, 8, 16)) {
        countedCombine(size)
        println("size=$size cellVisits=$cellVisitCount")
    }
}
```

Run for real, batch-compiled with this lesson's other lab via a single
`kotlinc` pass (see Commands Needed, below):

```
size=2 cellVisits=4
size=4 cellVisits=16
size=8 cellVisits=64
size=16 cellVisits=256
```

This real, executed output confirms the Socratic prompt's own
prediction, with real numbers: `4`, `16`, `64`, `256` — each one exactly
the square of its own matrix size (`2² = 4`, `4² = 16`, `8² = 64`,
`16² = 256`), and each one exactly four times its predecessor, matching
"doubling the input roughly quadruples the real work" precisely, not
approximately. `countedCombine`'s own real shape — a single, nested
`(0 until size).map { r -> (0 until size).map { c -> cellVisitCount++; ... } }` —
is the exact same real shape `add`'s own body already uses, quoted
faithfully rather than invented fresh, with one real counter added
purely to make its own real, invisible cost visible. This confirms
**quadratic time, `O(n²)`**, the same real growth rate this project's
own earlier complexity work already proved for different code — this
time proven for `Matrix`'s own new operations specifically.

### Discard the Throwaway Example

`countedCombine` and its own counter, `cellVisitCount`, are discarded
now — they exist only to make a real cost visible that `Matrix`'s own
permanent `add`/`subtract`/`transpose` never needed to expose
themselves.

### Mechanical Walkthrough

Every distinct element of the lab above, in the order it appears:

- `var cellVisitCount = 0` — a top-level, mutable variable declaration,
  using `var` rather than `val` specifically because its whole purpose
  is to change — a running total, reset and re-read across the loop in
  `main`, below. Declaring it outside any function makes it visible to
  both `countedCombine` (which increments it) and `main` (which reads
  it), matching the real shape a shared running counter needs.
- `fun countedCombine(size: Int): List<List<Int>>` — a function
  declaration taking one `Int` parameter, the square matrix's own side
  length, and returning a real `List<List<Int>>` — the counted operation
  still genuinely produces a real result, exactly like `add` does; only
  the counting is new.
- `cellVisitCount = 0` — resets the shared counter to zero at the start
  of every call, so measuring `size = 4` doesn't start from whatever
  `size = 2` already left behind.
- `val a = (0 until size).map { r -> (0 until size).map { c -> r * size + c } }`
  — builds one real, throwaway `size × size` grid of distinct numbers
  (`r * size + c` gives every cell a genuinely different value, useful
  only for making the lab's own printed result inspectable, not part of
  what's being measured). The same real `until` and `map` already fully
  documented in the Header, nested exactly as `Matrix`'s own real
  operations already nest them.
- `val b = ...` — a second, independently-built grid, identical in shape
  to `a`, standing in for the second `Matrix` a real `add` call would
  combine the first one with.
- `return (0 until size).map { r -> (0 until size).map { c -> cellVisitCount++; a[r][c] + b[r][c] } }`
  — the exact same nested shape `Matrix.add`'s own real body already
  uses, with one real addition to its innermost lambda:
  `cellVisitCount++`, real Kotlin post-increment (already established
  since this project's very first counting code), incrementing the
  shared counter by exactly one every time this innermost lambda runs —
  once per real cell of the result. `a[r][c] + b[r][c]` is the same real
  computation `add`'s own body performs, unchanged.
- `for (size in listOf(2, 4, 8, 16))` — a real `for`/`in` loop, running
  its own body once per element of the real `List<Int>` `listOf` just
  built, binding each one in turn to the local name `size`. This is the
  first `for`/`in` loop this specific lesson uses; the construct itself
  runs its body exactly as many times as its source collection has
  elements, with `size` taking on each real value, in order, one loop
  iteration at a time.
- `countedCombine(size)` — calls the function above, once per loop
  iteration, discarding its real return value (this lab only cares about
  the real side effect on `cellVisitCount`, not the grid itself).
- `println("size=$size cellVisits=$cellVisitCount")` — the same real
  `println` already documented, given a real Kotlin string template (a
  `String` literal containing `$size` and `$cellVisitCount`, each
  substituted with that variable's own real current value at the moment
  this line runs) — already-established syntax, reused here to print one
  labeled real line per matrix size.

### CS Lens

A real growth rate proportional to the square of the input size is a
real, recurring CS idea, **quadratic time**, already named and proven,
for different code, by this project's own earlier complexity work. Also
recognized in: nested-loop algorithms generally, wherever one loop of
size `n` sits inside another loop of size `n`; comparing every pair of
elements in a list of size `n` (a real `n × n` — `n²` — comparison
count); and, closer to this specific unit's own real subject,
image-processing filters that visit every pixel of an `n × n` image
exactly once, the identical real shape this unit's own lab just proved.

### SE Lens

The alternative not chosen here is measuring `add`, `subtract`, and
`transpose` with three separate labs, one per method, rather than one
shared `countedCombine` standing in for all three. That was a real,
deliberate choice: all three share the identical real cost shape — one
fixed amount of work per cell, visited once — so three separate labs
would have produced three sets of identical numbers, proving nothing a
single shared lab doesn't already prove just as completely. The real
cost, honestly stated: this lesson's own real, counted proof covers
`add`'s exact shape directly; `subtract` and `transpose` are asserted to
share it by inspection of their own already-quoted, already-verified
real bodies (this lesson's own immediate predecessor already showed all
three in full), not by running three separate counted labs — a
reasonable economy given how structurally identical the three already
are, but worth stating plainly rather than silently assumed.

### Commands Needed

Both of this lesson's labs were compiled together in one real, batched
pass:

```
$ kotlinc lab1_quadratic_family.kt lab2_cubic_multiply.kt -include-runtime -d labs.jar
```

Run on its own with:

```
$ java -cp labs.jar Lab1_quadratic_familyKt
```

### Run It

```
size=2 cellVisits=4
size=4 cellVisits=16
size=8 cellVisits=64
size=16 cellVisits=256
```

Real, saved at `verification/8.3/lab1_quadratic_family.kt` and
`verification/8.3/lab1_quadratic_family_run.txt`.

### Connect the Pieces

This unit proved three of `Matrix`'s five real operations share one real
growth rate, already named by this project's own earlier complexity
work. The next unit asks whether `multiply`'s own extra layer of nesting
— proven, in this lesson's immediate predecessor, to combine a whole row
with a whole column per result cell rather than one pair of values —
changes that growth rate, or merely adds a fixed amount of extra work on
top of the same one.

## Concept Unit: A New Growth Rate — Cubic Time

### The Problem

`multiply`'s own real body, fully built in this lesson's immediate
predecessor, nests three real ranges instead of two: one for the
result's own rows, one for the result's own columns, and, inside both of
those, a third — the real dot product — summing across the shared
dimension between the two input matrices. For a square `n × n` matrix
multiplied by another square `n × n` matrix, does that third, extra
layer of nesting change `multiply`'s own real growth rate, or does it
just add a fixed amount of constant extra work per cell, the same
`O(n²)` shape the previous unit already proved for `add`?

> The previous unit's own real, counted lab proved two nested
> `(0 until size)` loops produce `n²` total cell visits. `multiply`'s
> own real body nests a *third* `(0 until size)`-shaped range inside
> those first two, per result cell, rather than doing one fixed unit of
> work there. Given that, how many total real multiplications would you
> predict for a `2 × 2` case — two nested loops of size `2` still
> produce `4` result cells, but how many happen *inside* each one now?
> What about doubling to a `4 × 4` case — do you expect the real
> multiplication count to double, quadruple, or grow by some other real
> factor, given this third, nested layer?

### Introduce the Concept in Isolation

```kotlin
var multiplicationCount = 0

fun countedMultiply(size: Int): List<List<Int>> {
    multiplicationCount = 0
    val a = (0 until size).map { r -> (0 until size).map { c -> r * size + c } }
    val b = (0 until size).map { r -> (0 until size).map { c -> r * size + c } }
    return (0 until size).map { r ->
        (0 until size).map { c ->
            (0 until size).sumOf { k ->
                multiplicationCount++
                a[r][k] * b[k][c]
            }
        }
    }
}

fun main() {
    for (size in listOf(2, 4, 8, 16)) {
        countedMultiply(size)
        println("size=$size multiplications=$multiplicationCount")
    }
}
```

Run for real, from this lesson's own batched compile:

```
size=2 multiplications=8
size=4 multiplications=64
size=8 multiplications=512
size=16 multiplications=4096
```

This real, executed output proves the Socratic prompt's own predicted
concern true: `8`, `64`, `512`, `4096` — each one exactly the *cube* of
its own matrix size (`2³ = 8`, `4³ = 64`, `8³ = 512`, `16³ = 4096`), and
each one exactly *eight* times its predecessor, not four. Doubling `n`
here multiplies the real work by `2³ = 8`, not `2² = 4` — a genuinely
different, faster-growing real shape than every operation the previous
unit proved. `countedMultiply`'s own real shape — the identical nested
`map`-over-`until`-over-`sumOf` structure `Matrix.multiply`'s own real
body already uses, with one real counter added inside the innermost
`sumOf` lambda — proves this isn't a hypothetical concern; it's exactly
what this project's own real, shipped `multiply` method already does,
every time it's called. This confirms **cubic time, `O(n³)`** — a real
growth rate new to this project.

### Discard the Throwaway Example

`countedMultiply` and its own counter, `multiplicationCount`, are
discarded now — they exist only to make visible a real cost
`Matrix.multiply` itself never needed to expose to compute its own
correct answer.

### Mechanical Walkthrough

- `var multiplicationCount = 0` — the same real, mutable top-level
  counter pattern as the previous unit's own `cellVisitCount`, declared
  `var` for the identical reason: it has to change, over and over, as
  real multiplications happen.
- `fun countedMultiply(size: Int): List<List<Int>>` — structurally
  identical to the previous unit's own `countedCombine`: one `Int`
  parameter, one real `List<List<Int>>` result.
- `multiplicationCount = 0` — resets the counter at the start of every
  call, the same reason as the previous unit's own reset.
- `val a = ...` / `val b = ...` — two real, throwaway `size × size`
  grids, built exactly as the previous unit's own labs built them,
  standing in for the two real matrices `multiply` would actually
  combine.
- `(0 until size).map { r -> (0 until size).map { c -> (0 until size).sumOf { k -> ... } } }`
  — the exact real shape `Matrix.multiply`'s own body already uses,
  quoted faithfully: the outer `map` over `r` (one call per result row),
  the middle `map` over `c` (one call per result column, for this `r`),
  and, new relative to the previous unit, a third, nested `(0 until size).sumOf { k -> ... }`
  — the real dot-product calculation, already fully documented in this
  lesson's immediate predecessor, running once per result cell rather
  than a single fixed computation.
- `multiplicationCount++` — placed inside the innermost `sumOf` lambda,
  incrementing the shared counter once per individual real
  multiplication `sumOf`'s own `selector` actually performs — not once
  per result cell, the real, concrete difference from the previous
  unit's own counter placement.
- `a[r][k] * b[k][c]` — the same real dot-product computation
  `Matrix.multiply`'s own body already performs, unchanged: reading one
  value from row `r` of `a` and one value from column `c` of `b`, at the
  shared position `k`, and multiplying them.
- `for (size in listOf(2, 4, 8, 16))` and `println("size=$size multiplications=$multiplicationCount")`
  — the same real `for`/`in` loop and string-template `println` call
  already fully explained in the previous unit, unchanged here beyond
  which counter and which label get printed.

### CS Lens

A real growth rate proportional to the *cube* of the input size is a
real, recurring CS idea: **cubic time, `O(n³)`**. Also recognized in:
the classic, naive matrix-multiplication algorithm specifically, in
every language and every real numeric library that implements it this
same straightforward way (faster algorithms exist — Strassen's
algorithm among them — but are genuinely more complex, and not
something this project's own real, calculator-sized matrices need);
three-nested-loop algorithms generally, wherever a computation
genuinely requires comparing or combining data across three independent
dimensions at once; and, in physics simulations, certain
all-pairs-interaction calculations (every particle's real influence on
every other particle, computed across every relevant dimension) that
share this same real, three-nested-loop shape.

### SE Lens

The alternative not chosen here is leaving `multiply`'s own real cost
unmeasured — trusting, without real evidence, that "it's probably fine"
for whatever matrix sizes this project's own future Matrix Calculator
mode eventually lets a real user build. That trust would have been
misplaced specifically because of what this unit's own real, counted
evidence just proved: `multiply`'s cost doesn't just grow faster than
`add`'s, it grows *categorically* faster — the gap between `O(n²)` and
`O(n³)` widens without bound as `n` grows, unlike a gap that's merely a
larger constant factor on the same underlying shape. The real, honest
cost of *not* measuring this: a calculator UI that lets a user build
arbitrarily large matrices and multiply them without ever surfacing this
real cost difference risks a real, user-visible slowdown that would look
like a bug rather than what it actually is — the genuine, unavoidable
price of the correct algorithm at a large enough size. This lesson
doesn't fix that risk (no production code changes here at all); it
exists specifically to make the real cost visible and named, so a future
lesson deciding whether `multiply` needs a loading indicator, a size
limit, or a genuinely different algorithm is deciding with real,
measured evidence instead of a guess.

### Commands Needed

Already compiled in the same batched pass documented in the previous
unit. Run on its own with:

```
$ java -cp labs.jar Lab2_cubic_multiplyKt
```

### Run It

```
size=2 multiplications=8
size=4 multiplications=64
size=8 multiplications=512
size=16 multiplications=4096
```

Real, saved at `verification/8.3/lab2_cubic_multiply.kt` and
`verification/8.3/lab2_cubic_multiply_run.txt`.

### Connect the Pieces

The previous unit proved three of `Matrix`'s five operations share one
real, already-known growth rate; this unit proves the fourth,
`multiply`, genuinely does not — a real, new growth rate, `O(n³)`,
categorically faster-growing than `O(n²)`, confirmed with real counted
evidence rather than assumed from the extra layer of nesting alone.

## Closing

### Connect the Pieces

Every one of `Matrix`'s five real operations, placed on the same real
cost scale this lesson just built: `add`, `subtract`, and `transpose`
each visit every cell of an `n × n` grid exactly once, doing one fixed
unit of work per visit — real, counted `O(n²)` growth, proven in this
lesson's first unit by quoting `add`'s own real shape verbatim and
instrumenting it. `multiply` visits every cell of its own `n × n` result
too, but does a real, nested `n`-sized dot product at each one instead
of one fixed unit of work — real, counted `O(n³)` growth, proven in this
lesson's second unit the identical way, quoting `multiply`'s own real
shape verbatim. `determinant`, not given its own unit here since it
introduces no new growth rate this project hasn't already proven real
elsewhere, does a real, fixed number of operations — two multiplications
and one subtraction — regardless of any notion of size at all, because
its own two `require` checks only ever let it proceed for exactly one
real size, `2 × 2`; a real, constant-time operation by construction, not
by coincidence. Five real operations, two real growth rates, one of them
newly proven here: `Matrix`'s own real, honest cost profile is no longer
a guess.

**Next:** Lesson 8.4 returns to building real, permanent features —
introducing the Strategy pattern into this project's own code for the
first time, the point this lesson's own SE Lens already flagged as
`add`/`subtract`'s own real, hand-duplicated shape's natural next step.
