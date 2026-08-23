# Lesson 8.7: True for Every Matrix, Not Just One

*Mathematical Testing*

- **What you will build.** A new, real, permanent test file,
  `MatrixInvariantTest.kt`, testing this project's own complete Matrix
  API a genuinely different way than every test written so far in this
  Slice: not "does this one specific example produce this one specific
  answer," but "does this real mathematical rule hold for matrices in
  general." Along the way, a real, previously-undiscovered JVM
  limitation surfaces — and gets fixed — and this project's own real,
  permanent `Matrix<Double>.multiply` gets built for the first time,
  discovered as a genuine, concrete need while trying to test the one
  invariant this Slice has been building toward since its very first
  lesson: `A × A⁻¹ = I`.
- **What you need to know first.** This lesson's own five direct
  predecessors — `Matrix`'s complete real API (`add`, `subtract`,
  `multiply`, `transpose`, `determinant`, `identity`, `inverse`) and its
  own generic `Matrix<T>` shape; this project's own already-established
  `assertEquals`/`assertThrows` testing pattern; this project's own
  already-proven real floating-point-precision finding (`sin(180°)`
  computing to a tiny nonzero value, not a clean zero).

## Terms used in this lesson

- **Property-based testing** — a real, named testing technique: instead
  of checking that one specific, hand-picked example produces one
  specific, expected result, generate many different real inputs —
  often randomly — and check that a general rule holds across all of
  them. This exists because a single worked example only ever proves a
  rule true for that one case; a rule that's supposed to hold *in
  general* deserves evidence that spans more than one.
- **Invariant** — a property that must remain true regardless of the
  specific, real values involved. This project's own predecessor already
  used this term for a property a type system fails to enforce (a
  matrix's own rectangularity); this lesson's own use is the
  mathematical sense specifically — a rule, like `A × I = A`, that a
  correct implementation must satisfy for *every* real input, not merely
  the one a test happens to check.
- **Counterexample** — a single, concrete, real input that disproves a
  general claim. This exists because disproving "this is always true"
  only ever requires one real case where it's false — unlike proving a
  rule always holds, which needs evidence spanning many cases,
  disproving it needs exactly one.
- **Type erasure** — a real, fundamental fact about how Kotlin's own
  generics actually compile to the JVM: a generic type parameter exists
  only in the Kotlin source and at compile time — by the time code
  becomes real JVM bytecode, `Matrix<Int>` and `Matrix<Double>` are both
  just `Matrix`, with no trace of which type was ever filled in for
  `T`. This exists because the JVM itself predates Java's own generics
  by years, and generics were added, later, as a real, deliberate
  compile-time-only feature layered on top of a runtime that was never
  changed to understand them.
- **`@JvmName`** — a real, standard Kotlin annotation letting an author
  give a function a different real name at the JVM bytecode level than
  the name Kotlin source code actually calls it by. This exists
  specifically to resolve real collisions type erasure can cause — two
  functions that are genuinely distinct in Kotlin's own type system, but
  erase to the identical real JVM method signature, can each be given a
  different real underlying name, invisibly, so Kotlin callers never see
  any difference at all.

## Objects and methods used

- **`Matrix<Double>.multiply`**
  - *What it is:* this project's own new, permanent, real matrix
    multiplication for `Double`-holding matrices — this lesson's own
    real, motivated addition, discovered as a genuine gap while trying
    to test this lesson's own final real invariant.
  - *Implementation:* `@JvmName("multiplyDouble") fun Matrix<Double>.multiply(other: Matrix<Double>): Matrix<Double>`
    — the identical real dot-product shape `Matrix<Int>.multiply`
    already uses, computing on genuine `Double` values instead of `Int`
    ones.
  - *Its use:* this is the only real way this project can compute
    `A × A⁻¹` for a real `Matrix<Double>` — without it, `inverse()`'s own
    real result would have no operation available to combine it back
    with the original matrix at all.
  - *Type:* a top-level extension function, receiver type
    `Matrix<Double>`, marked `@JvmName` to avoid a real JVM signature
    collision with `Matrix<Int>.multiply`.
  - *Responsibility:* combine two compatibly-shaped `Matrix<Double>`s via
    a real dot product per result cell — the identical charter
    `Matrix<Int>.multiply` already has, for a different concrete type.
  - *Depends on:* a real `Matrix<Double>` receiver and argument;
    `require`, `until`, `map`, and the real `Double`-producing overload
    of `sumOf`.
  - *Connects to:* called directly by this lesson's own real tests;
    calls `require`, `until`, `map`, `sumOf`, and constructs a fresh
    `Matrix<Double>`.
  - *Shape:* a public API surface — this project's own second, real,
    type-specific `multiply`, proving the extension-function pattern
    this project's own earlier work established genuinely generalizes
    beyond the one concrete type it was first built for.
- **`Random.nextInt`**
  - *What it is:* a real method on Kotlin's own standard-library
    `Random` class, producing a genuinely unpredictable `Int` within a
    given real range.
  - *Implementation:* `public abstract fun nextInt(from: Int, until: Int): Int`,
    confirmed from the real, current source in
    `kotlin-stdlib-sources.jar` — an abstract member of the real
    `kotlin.random.Random` class, with `Random.Default` (reached simply
    as `Random`) providing a real, working implementation.
  - *Its use:* this lesson's own tests use it to build real matrices out
    of genuinely unpredictable numbers, rather than the same few
    hand-picked values every earlier test in this project has used.
  - *Type:* an instance method on the real `Random` class.
  - *Responsibility:* to return one real, unpredictable `Int`, at least
    `from` and less than `until`, with no guarantee about which specific
    value beyond that real range.
  - *Depends on:* the real `from`/`until` bounds; an underlying real
    source of randomness this project's own code never has to manage
    itself.
  - *Connects to:* called directly by this lesson's own new test helper
    functions; its own unpredictable results become real cell values
    handed to `Matrix`'s own real constructor.
  - *Shape:* a public stdlib API surface — this project's own first real
    use of genuine randomness anywhere in its own code.
- **`repeat`**
  - *What it is:* a real Kotlin standard-library function that runs a
    given block of code a fixed number of times.
  - *Implementation:* `public inline fun repeat(times: Int, action: (Int) -> Unit): Unit`,
    confirmed from the real, current source in
    `kotlin-stdlib-sources.jar`.
  - *Its use:* this is the real mechanism behind every one of this
    lesson's own property-based tests — `repeat(100) { ... }` runs the
    same real check against `100` separately-generated random matrices,
    rather than checking just one.
  - *Type:* a top-level, inline function.
  - *Responsibility:* to call its own `action` lambda exactly `times`
    times, handing each call the current iteration count (`0` through
    `times - 1`), and do nothing else.
  - *Depends on:* the `times` count and an `action` block to run.
  - *Connects to:* called directly by this lesson's own tests; its own
    `action` lambda, in every one of this lesson's real uses, builds a
    fresh random matrix and asserts a real invariant against it.
  - *Shape:* a public, foundational stdlib API surface — the direct,
    idiomatic Kotlin way to say "do this exact thing several times,"
    reached for here instead of a hand-written counting loop.

**Everything else in the file, not this lesson's subject but still explained.**

- **`assertEquals` (three-argument, `Double` overload)**
  - *What it is:* a real, distinct overload of JUnit's own already-
    established `assertEquals`, taking a real tolerance alongside the
    expected and actual values.
  - *Implementation:* `public static void assertEquals(double expected, double actual, double delta)`,
    a real overload confirmed via `javap` against the actual installed
    `junit-4.13.2.jar` — a genuinely different real method from the
    two-argument `Object`-comparing overload this project's own earlier
    tests already used.
  - *Its use:* this lesson's own final test needs it specifically
    because real `Double` arithmetic, confirmed for real this session,
    doesn't always land on an exact value — this overload lets a test
    assert "close enough," with a real, explicit, honest tolerance,
    rather than an exact match that real floating-point rounding could
    fail for a reason that has nothing to do with whether the code is
    actually correct.
  - *Type:* a `static` method — a real, separate overload from this
    project's own already-used two-argument version.
  - *Responsibility:* to compare two real `Double` values and fail the
    test only if they differ by more than the given `delta` — never
    requiring bit-for-bit identical floating-point results.
  - *Depends on:* the expected value, the actual value, and a real,
    chosen tolerance.
  - *Connects to:* called directly by this lesson's own final test, once
    per real cell of a computed result.
  - *Shape:* a public testing-library API surface — this project's own
    first real use of tolerance-based floating-point comparison in a
    permanent test.
- **`assertNotEquals`**
  - *What it is:* a real static method from JUnit asserting that two
    values are genuinely *not* equal.
  - *Implementation:* `public static void assertNotEquals(Object unexpected, Object actual)`,
    confirmed via `javap` against the actual installed
    `junit-4.13.2.jar`.
  - *Its use:* this lesson's own real counterexample test uses it to
    prove `A × B` and `B × A` are genuinely different real `Matrix`
    values for one, specific, concrete pair — the direct real opposite
    of every `assertEquals` call this project's own tests have used so
    far.
  - *Type:* a `static` method.
  - *Responsibility:* to compare two values and fail the test if they
    turn out to be equal — the real inverse of `assertEquals`'s own
    charter.
  - *Depends on:* the two values being compared; for two `Matrix`
    instances, it depends on the same real, compiler-generated `equals`
    `assertEquals` already relies on, from `Matrix` being a `data
    class`.
  - *Connects to:* called directly by this lesson's own real test;
    reads `Matrix`'s own generated `equals` the same way `assertEquals`
    already does, just requiring the opposite real answer.
  - *Shape:* a public testing-library API surface — this project's own
    first real use of a "these must differ" assertion.

Every real signature quoted above was fetched and confirmed this
session — `Matrix<Double>.multiply`'s own signature from this lesson's
own real project change; `Random.nextInt` and `repeat` from the genuine,
currently-installed `kotlin-stdlib-sources.jar`; `assertEquals`'s
three-argument overload and `assertNotEquals` from a real `javap`
inspection of the actual installed `junit-4.13.2.jar` — not written from
memory.

## Concept Unit: Property-Based Testing, and the Identity Invariant

### The Problem

Every test this project has already written follows the same
real shape: pick specific, concrete numbers, compute one specific
expected answer by hand, and check the real code produces exactly that.
This proves a rule true for exactly the cases actually tried — nothing
about `A × I = A`, the identity invariant BRD's own Slice 8 plan names
by name, is genuinely *about* one specific matrix; it's a claim about
*every* real matrix. Is there a real, honest way to test a claim that
broad, without literally trying every possible matrix (infinitely many,
for real number cells) by hand?

> This project already has real, working randomness available to
> it — nothing in `Random.nextInt(from, until)` cares what it's used
> for. Given that, instead of writing one test with one hand-picked
> matrix, what would you try building many *different*, real,
> unpredictable matrices and checking the same real rule against every
> one of them? How many real trials would feel like genuine evidence,
> as opposed to one lucky coincidence — and would you expect a real,
> correct implementation to ever fail even one of them, no matter how
> many you tried?

### Introduce the Concept in Isolation

```kotlin
import kotlin.random.Random

fun main() {
    repeat(5) {
        val a = Random.nextInt(-100, 100)
        val b = Random.nextInt(-100, 100)
        println("$a + $b == $b + $a: ${a + b == b + a}")
    }
}
```

Run for real, batch-compiled with this lesson's other working lab via a
single `kotlinc` pass (see Commands Needed, below):

```
-65 + -93 == -93 + -65: true
-69 + 95 == 95 + -69: true
-3 + -43 == -43 + -3: true
27 + 61 == 61 + 27: true
26 + -70 == -70 + 26: true
```

This real, executed output — genuinely unpredictable each real run,
since `Random.nextInt` was never seeded, but its own real underlying
claim (plain `Int` addition commutes) guarantees every single trial
prints `true`, on this run and any future one — proves the real
mechanism: `repeat(5) { ... }` runs the exact same real check five
separate times, each with a fresh pair of genuinely random numbers, and
a real, correct claim about arithmetic holds every single time, not
because these five specific numbers happen to be special. This is
called **property-based testing**: checking that a claimed
**invariant** holds across many real, varied inputs, rather than one.

### Discard the Throwaway Example

This exact loop is discarded now — but the real property-based-testing
pattern it just proved (`repeat(n) { generate real random input; assert
a rule holds }`) is exactly what this project's own real identity
invariant test needs.

### Project Change

- **Reference Source** — no reference counterpart; a from-scratch
  addition, this project's own first real test using genuine randomness.
- **Files affected** — a new file,
  `app/src/test/java/com/example/calculator/MatrixInvariantTest.kt`.
- **Change type** — add (new file).
- **Location** — none yet; this is the file's first content.
- **Dependencies** — `Matrix<Int>`'s own real `multiply` and
  `Matrix.identity`, both already real.

### The New Code

```kotlin
package com.example.calculator

import kotlin.random.Random
import org.junit.Assert.assertEquals
import org.junit.Test

class MatrixInvariantTest {

    private fun randomIntMatrix(): Matrix<Int> {
        return Matrix(listOf(
            listOf(Random.nextInt(-10, 10), Random.nextInt(-10, 10)),
            listOf(Random.nextInt(-10, 10), Random.nextInt(-10, 10))
        ))
    }

    @Test
    fun multiplyingByIdentityReturnsTheOriginalMatrixForManyRandomMatrices() {
        repeat(100) {
            val a = randomIntMatrix()

            assertEquals(a, a.multiply(Matrix.identity(2)))
        }
    }
}
```

### The Updated Project

This is the entirety of `MatrixInvariantTest.kt`'s own first real
content — a brand-new file with nothing surrounding it yet, so there is
no larger enclosing structure to return to; the block just shown *is*
the whole new structure. As it stands right now, this project has one
real, permanent, passing property-based test, proving `A × I = A` for
`100` separately-generated random `2×2` `Int` matrices every time this
test suite runs.

### Mechanical Walkthrough

Every distinct element of the New Code above, in the order it appears:

- `package com.example.calculator` — the same real package declaration
  every file in this project already has.
- `import kotlin.random.Random`, `import org.junit.Assert.assertEquals`,
  `import org.junit.Test` — three real import statements, already an
  established pattern in this project's own test files, naming exactly
  which real declarations this file depends on from outside its own
  package.
- `class MatrixInvariantTest` — an ordinary class declaration, the same
  real construct every one of this project's own test classes already
  uses.
- `private fun randomIntMatrix(): Matrix<Int>` — a real, private helper
  method, visible only inside `MatrixInvariantTest` itself, returning a
  real `Matrix<Int>`.
- `listOf(listOf(Random.nextInt(-10, 10), Random.nextInt(-10, 10)), listOf(Random.nextInt(-10, 10), Random.nextInt(-10, 10)))`
  — four separate real calls to `Random.nextInt(-10, 10)`, each one
  independently producing a genuinely unpredictable real `Int` from
  `-10` up to (not including) `10`, building a real `2×2` grid one cell
  at a time — the same real `listOf` nesting pattern this project's own
  earliest matrix work already established, here filled with real
  random values instead of literals.
- `@Test fun multiplyingByIdentityReturnsTheOriginalMatrixForManyRandomMatrices()`
  — the same real `@Test` annotation every test method in this project
  already uses, naming this specific test's own real, honest claim in
  full.
- `repeat(100) { ... }` — the same real `repeat` function proven in
  isolation above, here run `100` times rather than `5` — a real,
  deliberately larger number of trials for a test that will actually
  become part of this project's own permanent suite, run every time it
  runs.
- `val a = randomIntMatrix()` — one fresh, genuinely random `2×2`
  `Matrix<Int>`, built anew on every one of the `100` real iterations.
- `assertEquals(a, a.multiply(Matrix.identity(2)))` — the same real
  `assertEquals` already established throughout this project, here
  comparing `a` itself against `a.multiply(Matrix.identity(2))` — the
  real, already-built `identity` factory function and the real,
  already-built `multiply` extension function, composed together to
  state, directly, this unit's own real claim: multiplying any real
  matrix by the identity matrix of a matching size returns that exact
  same real matrix back.

### CS Lens

Checking a claimed rule against many real, generated inputs rather than
one fixed example is a real, recurring CS/SE idea: **property-based
testing**. Also recognized in: fuzz testing, a real, widely-used
security and reliability technique feeding a real program large volumes
of randomly-generated input specifically looking for a real crash or
incorrect result no hand-picked example happened to trigger; real
property-based testing libraries (QuickCheck, and its many real
ports to other languages) built specifically to automate exactly this
pattern; and mathematical proof by exhaustive case-checking generally,
where a claim about "every" member of some real set is verified by
actually checking a representative, sufficiently large sample of them.

### SE Lens

The alternative not chosen here is testing the identity invariant with
one single, hand-picked example — `Matrix(listOf(listOf(1, 2), listOf(3, 4)))`,
say, multiplied by `Matrix.identity(2)`, asserted equal to the original
— exactly the same real shape every earlier test in this project already
uses. That real alternative is genuinely cheaper to write and run, and
it does prove the invariant true for that one specific matrix. The real
cost, honestly stated: a single example can never distinguish "this rule
is genuinely always true" from "this rule happens to be true for the one
case I tried" — a real implementation bug that only manifests for
certain matrices (a sign error affecting only negative values, say)
could pass a single-example test cleanly while still being genuinely
broken. Property-based testing's own real cost, in exchange: `100`
real matrix constructions and `100` real multiplications, every time
this specific test runs, instead of one — a real, deliberate trade of
raw test-suite speed for broader, more genuine confidence, judged worth
making here specifically because this test is checking a real
mathematical law, not one specific worked example.

### Commands Needed

Both of this lesson's working labs were compiled together in one real,
batched pass:

```
$ kotlinc lab1_property_based_testing.kt lab2_multiplication_counterexample.kt -include-runtime -d labs.jar
```

Run on its own with:

```
$ java -cp labs.jar Lab1_property_based_testingKt
```

This unit's own real project change was verified with a full
`./gradlew testDebugUnitTest assembleDebug` (see the Closing, below,
which covers this lesson's complete, final state).

### Run It

```
-65 + -93 == -93 + -65: true
-69 + 95 == 95 + -69: true
-3 + -43 == -43 + -3: true
27 + 61 == 61 + 27: true
26 + -70 == -70 + 26: true
```

Real, saved at `verification/8.7/lab1_property_based_testing.kt` and
`verification/8.7/lab1_property_based_testing_run.txt`. The real project
change was confirmed via a full, clean
`./gradlew testDebugUnitTest assembleDebug` run,
`multiplyingByIdentityReturnsTheOriginalMatrixForManyRandomMatrices`
passing all `100` of its own real trials.

### Connect the Pieces

This unit gave this project its first real, permanent test proving a
genuine mathematical law, not one worked example — the next unit puts
the identical real technique to a very different use: proving a claim
is *not* universally true, which turns out to need a genuinely different
real approach.

## Concept Unit: Commutativity — True, and False

### The Problem

Addition commutes — `A + B` and `B + A` are always the same real
matrix, for any two same-shaped matrices — the previous unit's own real
technique can prove that directly. Real matrix multiplication is
different: does `A × B` always equal `B × A`, the same way ordinary
number multiplication does? If the real answer turns out to be no, is
running `100` more random trials, the previous unit's own real
technique unchanged, still the right way to prove it?

> Try this concretely, on paper or in your head, before running
> anything: `A = [[1, 2], [3, 4]]`, `B = [[5, 6], [7, 8]]`. Would you
> expect `A × B` and `B × A` to come out the same, or different? And
> separately — suppose real multiplication genuinely doesn't commute in
> general, but happens to commute for a few unlucky, special real
> matrices (an identity matrix, say, or two matrices that are both
> plain multiples of the identity). If a property-based test ran `100`
> random trials and happened to draw one of those special cases, would
> that test still reliably catch that multiplication doesn't commute in
> general, or could real bad luck let it pass anyway?

### Introduce the Concept in Isolation

```kotlin
fun multiply2x2(x: List<List<Int>>, y: List<List<Int>>): List<List<Int>> {
    return listOf(
        listOf(x[0][0] * y[0][0] + x[0][1] * y[1][0], x[0][0] * y[0][1] + x[0][1] * y[1][1]),
        listOf(x[1][0] * y[0][0] + x[1][1] * y[1][0], x[1][0] * y[0][1] + x[1][1] * y[1][1])
    )
}

fun main() {
    val a = listOf(listOf(1, 2), listOf(3, 4))
    val b = listOf(listOf(5, 6), listOf(7, 8))
    println(multiply2x2(a, b))
    println(multiply2x2(b, a))
}
```

Run for real, from this lesson's own batched compile:

```
[[19, 22], [43, 50]]
[[23, 34], [31, 46]]
```

This real, executed output proves the Socratic prompt's own concern is
real: for this specific, concrete pair, `A × B` is `[[19, 22], [43, 50]]`
and `B × A` is `[[23, 34], [31, 46]]` — genuinely, provably different
real matrices, confirmed by real, hand-traceable arithmetic
(`1×5 + 2×7 = 19`, matching the isolated lab's own first printed cell).
This one, single, concrete pair is a real **counterexample**: it alone
is enough to disprove "matrix multiplication always commutes," fully,
permanently, and with total certainty — no number of *additional*
examples could make this disproof any more true than it already is.

### Discard the Throwaway Example

`multiply2x2` and this exact pair of matrices are discarded now — but
the real numbers they just proved (`[[19, 22], [43, 50]]` versus
`[[23, 34], [31, 46]]`) are exactly the real counterexample this
project's own permanent test needs.

### Project Change

- **Reference Source** — no reference counterpart; a from-scratch
  addition.
- **Files affected** —
  `app/src/test/java/com/example/calculator/MatrixInvariantTest.kt`.
- **Change type** — add (two new test methods).
- **Location** — inside `MatrixInvariantTest`, directly after the
  previous unit's own test method.
- **Dependencies** — `Matrix<Int>`'s own real `add` and `multiply`; a
  new import, `org.junit.Assert.assertNotEquals`.

### The New Code

```kotlin
@Test
fun additionIsCommutativeForManyRandomMatrices() {
    repeat(100) {
        val a = randomIntMatrix()
        val b = randomIntMatrix()

        assertEquals(a.add(b), b.add(a))
    }
}

@Test
fun multiplicationIsNotCommutativeForThisConcreteCounterexample() {
    val a = Matrix(listOf(listOf(1, 2), listOf(3, 4)))
    val b = Matrix(listOf(listOf(5, 6), listOf(7, 8)))

    assertNotEquals(a.multiply(b), b.multiply(a))
}
```

### The Updated Project

```kotlin
1:  package com.example.calculator
2:
3:  import kotlin.random.Random
4:  import org.junit.Assert.assertEquals
5:  import org.junit.Assert.assertNotEquals // ← new
6:  import org.junit.Test
7:
8:  class MatrixInvariantTest {
9:
10:     private fun randomIntMatrix(): Matrix<Int> {
11:         return Matrix(listOf(
12:             listOf(Random.nextInt(-10, 10), Random.nextInt(-10, 10)),
13:             listOf(Random.nextInt(-10, 10), Random.nextInt(-10, 10))
14:         ))
15:     }
16:
17:     @Test
18:     fun multiplyingByIdentityReturnsTheOriginalMatrixForManyRandomMatrices() {
19:         repeat(100) {
20:             val a = randomIntMatrix()
21:
22:             assertEquals(a, a.multiply(Matrix.identity(2)))
23:         }
24:     }
25:
26:     @Test // ← new
27:     fun additionIsCommutativeForManyRandomMatrices() { // ← new
28:         repeat(100) { // ← new
29:             val a = randomIntMatrix() // ← new
30:             val b = randomIntMatrix() // ← new
31:
32:             assertEquals(a.add(b), b.add(a)) // ← new
33:         } // ← new
34:     } // ← new
35:
36:     @Test // ← new
37:     fun multiplicationIsNotCommutativeForThisConcreteCounterexample() { // ← new
38:         val a = Matrix(listOf(listOf(1, 2), listOf(3, 4))) // ← new
39:         val b = Matrix(listOf(listOf(5, 6), listOf(7, 8))) // ← new
40:
41:         assertNotEquals(a.multiply(b), b.multiply(a)) // ← new
42:     } // ← new
43: }
```

`MatrixInvariantTest` now proves two real, contrasting facts about
commutativity in one file: addition commutes, proven across `100` real,
varied trials; multiplication does not, proven with exactly one real,
concrete, permanent counterexample.

### Mechanical Walkthrough

- `import org.junit.Assert.assertNotEquals` — a new real import,
  bringing `assertNotEquals`, documented in the Header, into scope.
- `@Test fun additionIsCommutativeForManyRandomMatrices()` — the
  identical real property-based-testing shape the previous unit already
  proved: `repeat(100) { ... }`, two fresh random matrices per
  iteration, and `assertEquals(a.add(b), b.add(a))` — the real,
  already-established `add` extension function, called with its own
  operands swapped, asserted equal both ways, every single one of the
  `100` real trials.
- `@Test fun multiplicationIsNotCommutativeForThisConcreteCounterexample()`
  — a genuinely different real shape: no `repeat`, no randomness, one
  fixed, hand-chosen pair of matrices, real, identical to the ones just
  proven, in isolation, to produce different real products.
- `assertNotEquals(a.multiply(b), b.multiply(a))` — the real
  `assertNotEquals` function documented in the Header, called here in
  place of `assertEquals` — the real, deliberate opposite assertion,
  proving `a.multiply(b)` and `b.multiply(a)` are genuinely different
  real `Matrix` values for this one, real, chosen pair.

### CS Lens

Choosing between "prove true across many cases" and "disprove with one
case," depending on which real logical claim is actually being made, is
a real, recurring idea in both CS and formal logic: **existential versus
universal claims**. Also recognized in: mathematical proof technique
generally — a universal claim ("for all real numbers...") requires
general reasoning or exhaustive case coverage, while an existential
claim ("there exists a real number such that...") only ever needs one
concrete witness; real bug reports, where "this crashes" needs exactly
one reproducing case, while "this never crashes" needs much broader
evidence; and real database query optimization, where proving an index
*can* speed up a query needs one example, while proving a query
optimizer's own rule always holds needs much more.

### SE Lens

The alternative not chosen here is testing multiplication's own
non-commutativity the same way addition's commutativity was just
tested — `repeat(100) { assertNotEquals(a.multiply(b), b.multiply(a)) }`
with fresh random matrices each time. That alternative was investigated
and rejected for a real, concrete reason, directly following from this
unit's own Socratic prompt: some real matrix pairs genuinely *do*
commute under multiplication (multiplying by `Matrix.identity`, or by
another matrix that happens to be a plain scalar multiple of it, are
two real, easy-to-hit examples) — a random-trial version of this test
would be **flaky**: it would usually pass, and occasionally, unluckily,
fail to catch the real non-commutativity this unit set out to prove, or
worse, occasionally *pass by accident* on a run where every one of its
`100` random pairs happened to commute. A single, deliberately-chosen,
permanent counterexample has no such risk — the exact same real numbers,
producing the exact same real, different products, every single time
this test runs, forever.

### Commands Needed

Already compiled in the same batched pass documented in the previous
unit. Run on its own with:

```
$ java -cp labs.jar Lab2_multiplication_counterexampleKt
```

This unit's own real project change was verified with
`./gradlew :app:compileDebugKotlin` (full suite covered in the Closing).

### Run It

```
[[19, 22], [43, 50]]
[[23, 34], [31, 46]]
```

Real, saved at
`verification/8.7/lab2_multiplication_counterexample.kt` and
`verification/8.7/lab2_multiplication_counterexample_run.txt`.

### Connect the Pieces

This unit proved property-based testing and single-counterexample
testing are both real, valid tools, chosen deliberately based on
whether a claim is being proven true in general or false in one real
case. The final unit needs both ideas at once, plus a genuinely new
real obstacle neither previous unit encountered.

## Concept Unit: A Real JVM Collision, and the Final Invariant

### The Problem

This Slice's own real, motivating cliffhanger, since its very first
lesson, has been building toward one specific real invariant:
`A × A⁻¹ = I` — a matrix multiplied by its own real inverse returns the
identity. `inverse()` already exists, real and permanent, for
`Matrix<Double>`. But testing `a.multiply(a.inverse())` runs into a real
problem before a single test even executes: `multiply` only exists for
`Matrix<Int>`. Does this project genuinely need a second, real
`Matrix<Double>.multiply` — and if declaring one is attempted, is that
actually as simple as it sounds?

> This project's own `Matrix<Int>.multiply` and a hypothetical
> `Matrix<Double>.multiply` would be two, real, separately-declared
> Kotlin functions — genuinely different, as far as Kotlin's own type
> system is concerned, since `Matrix<Int>` and `Matrix<Double>` are
> different types. Kotlin code eventually becomes real JVM bytecode,
> though, and the JVM itself is significantly older than generics —
> given that, would you expect the *compiled* version of
> `Matrix<Int>.multiply` and `Matrix<Double>.multiply` to still look
> like two genuinely different real methods to the JVM, or could
> something about how generics actually compile down cause a real
> problem neither Kotlin's own source-level type-checking would predict?
> And if declaring both really does turn out to cause a real conflict,
> would you expect Kotlin to offer some real way to keep both callable
> with the exact same familiar syntax anyway, or would giving them two
> genuinely different Kotlin-visible names be the only real option left?

### Introduce the Concept in Isolation

This unit's own real "lab" is the real project change itself — the
first attempt at `Matrix<Double>.multiply`, written the same way
`Matrix<Int>.multiply` already exists, produced a real, genuine compiler
error, not a working isolated example:

```kotlin
fun Matrix<Double>.multiply(other: Matrix<Double>): Matrix<Double> {
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

```
Matrix.kt:35:1 Platform declaration clash: The following declarations have the same JVM signature (multiply(Lcom/example/calculator/Matrix;Lcom/example/calculator/Matrix;)Lcom/example/calculator/Matrix;):
    fun Matrix<Double>.multiply(other: Matrix<Double>): Matrix<Double> defined in com.example.calculator
    fun Matrix<Int>.multiply(other: Matrix<Int>): Matrix<Int> defined in com.example.calculator
```

This real, genuine compile error — from a real, unmodified `./gradlew
:app:compileDebugKotlin` run, not a guess about what "probably" happens
— proves the Socratic prompt's own real concern exactly right: the
compiler's own error message names the identical real JVM signature,
`multiply(Lcom/example/calculator/Matrix;Lcom/example/calculator/Matrix;)Lcom/example/calculator/Matrix;`,
for *both* declarations — real, concrete evidence that
`Matrix<Double>` and `Matrix<Int>` genuinely disappear, becoming
identical raw `Matrix`, the instant Kotlin source becomes real JVM
bytecode. This is called **type erasure**, and it is a real, permanent
fact about how the JVM works, not a bug or an oversight in this
project's own code.

### Discard the Throwaway Example

Nothing here is discarded — this real error, and its real fix, both
become permanent: the fix is exactly what `Matrix.kt`'s own real,
final, working `Matrix<Double>.multiply` needs.

### Project Change

- **Reference Source** — `Matrix<Int>.multiply`'s own already-real body,
  ported to `Double`, not rewritten — the dot-product logic itself is
  unchanged.
- **Files affected** —
  `app/src/main/java/com/example/calculator/Matrix.kt`;
  `app/src/test/java/com/example/calculator/MatrixInvariantTest.kt`.
- **Change type** — add.
- **Location** — `Matrix.kt`: a new top-level function, directly before
  `Matrix<Double>.inverse`. `MatrixInvariantTest.kt`: a new helper
  function and a new test, at the end of the class.
- **Dependencies** — `require`, `until`, `map`, and the real
  `Double`-producing overload of `sumOf`; the real `@JvmName` fix, this
  unit's own real, motivating finding.

### The New Code

```kotlin
@JvmName("multiplyDouble")
fun Matrix<Double>.multiply(other: Matrix<Double>): Matrix<Double> {
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
1:  fun Matrix<Int>.determinant(): Int {
2:      require(rows == cols) { "Determinant is only defined for a square matrix" }
3:      require(rows == 2) { "This project's determinant only supports 2x2 matrices for now" }
4:      return this[0, 0] * this[1, 1] - this[0, 1] * this[1, 0]
5:  }
6:
7:  @JvmName("multiplyDouble") // ← new
8:  fun Matrix<Double>.multiply(other: Matrix<Double>): Matrix<Double> { // ← new
9:      require(cols == other.rows) { // ← new
10:         "Left matrix's column count must match right matrix's row count to multiply" // ← new
11:     } // ← new
12:     return Matrix((0 until rows).map { r -> // ← new
13:         (0 until other.cols).map { c -> // ← new
14:             (0 until cols).sumOf { k -> this[r, k] * other[k, c] } // ← new
15:         } // ← new
16:     }) // ← new
17: } // ← new
18:
19: fun Matrix<Double>.inverse(): Matrix<Double> {
20:     require(rows == cols) { "Inverse is only defined for a square matrix" }
21:     require(rows == 2) { "This project's inverse only supports 2x2 matrices for now" }
22:     val det = this[0, 0] * this[1, 1] - this[0, 1] * this[1, 0]
23:     require(det != 0.0) { "Matrix is not invertible: determinant is zero" }
24:     return Matrix(listOf(
25:         listOf(this[1, 1] / det, -this[0, 1] / det),
26:         listOf(-this[1, 0] / det, this[0, 0] / det)
27:     ))
28: }
```

`Matrix.kt` now has a real `Matrix<Double>.multiply`, sitting directly
between `Matrix<Int>.determinant` and `Matrix<Double>.inverse` — real,
working, and, thanks to `@JvmName`, no longer in conflict with
`Matrix<Int>.multiply` at the real JVM level, even though both are still
called identically, `a.multiply(b)`, from any real Kotlin call site.

### Mechanical Walkthrough

- `@JvmName("multiplyDouble")` — the real annotation proven necessary by
  this unit's own real, caught compile error, placed directly above the
  function it applies to. `"multiplyDouble"` is a real, arbitrary string
  this project's own author chose — any distinct name would resolve the
  real collision equally well; Kotlin callers never see or type this
  string anywhere, only the real compiled `.class` file's own internal
  method table does.
- `fun Matrix<Double>.multiply(other: Matrix<Double>): Matrix<Double>`
  — the same real extension-function shape already fully established,
  receiver type `Matrix<Double>` instead of `Matrix<Int>`.
- `require(cols == other.rows) { ... }` — the identical real dimension
  check `Matrix<Int>.multiply` already uses, unchanged.
- `return Matrix((0 until rows).map { r -> (0 until other.cols).map { c -> (0 until cols).sumOf { k -> this[r, k] * other[k, c] } } })`
  — the identical real nested `map`-over-`until`-over-`sumOf` shape
  already fully established, computing on genuine `Double` values this
  time — `sumOf`'s own real `selector` lambda here returns a `Double`
  (`this[r, k] * other[k, c]`, both real `Double`s), resolving to the
  real, separate `Iterable<T>.sumOf(selector: (T) -> Double): Double`
  overload — a genuinely different real overload from the `Int`-returning
  one every earlier use of `sumOf` in this project has resolved to,
  confirmed present in the real, installed stdlib source alongside it.

### CS Lens

A property of the underlying platform silently shaping what's possible
in a higher-level language, invisible until it actually causes a real
collision, is a real, recurring CS idea: **type erasure**, specifically,
and, more broadly, **leaky abstraction** — a real abstraction (Kotlin's
own generics) that mostly hides its own real implementation detail (the
JVM's own lack of runtime generic type information) until a specific,
real situation forces that detail back into view. Also recognized in:
Java's own identical, real generics-erasure behavior (Kotlin's own JVM
target inherits this directly, since it compiles to the same real
bytecode); network protocols that mostly hide real packet fragmentation
from application code, until a sufficiently large real message forces
it into view; and virtual memory, which mostly hides a real machine's
actual physical memory layout from a running program, until real memory
pressure forces a visible, real slowdown.

### SE Lens

The alternative not chosen here is giving the `Double` version a
genuinely different Kotlin-visible name — `multiplyDouble`, called
directly at every real call site — rather than using `@JvmName` to keep
both versions callable as plain `a.multiply(b)` from Kotlin. That
alternative would have avoided the real JVM collision just as
completely, with less real ceremony (no annotation to learn or apply).
It was rejected for a real, concrete readability reason: every other
real, type-specific operation in this project (`Matrix<Int>.add`,
`.subtract`, `.determinant`) already reads identically regardless of
which concrete type it's scoped to — a caller writes `a.multiply(b)` and
lets Kotlin's own type system pick the right real implementation,
exactly the way `add`/`subtract`/`determinant` already work. Introducing
one differently-named exception, purely because of an underlying JVM
detail with nothing to do with this project's own real design, would
have leaked that real implementation detail into every future caller's
own code, permanently, for a problem `@JvmName` exists specifically to
solve invisibly instead.

### Commands Needed

The real, failing first attempt was compiled via the real project's own
build:

```
$ ./gradlew :app:compileDebugKotlin
```

(the real, printed `Platform declaration clash` error is the expected,
real result of that specific attempt — not a failure of this lesson's
own process). After applying `@JvmName`, this unit's own real, complete
project change was verified with a full
`./gradlew testDebugUnitTest assembleDebug`.

### Run It

The real, complete, final test suite run, covering every unit this
lesson built, is shown in the Closing, below.

### Connect the Pieces

With a real `Matrix<Double>.multiply` now genuinely working, this
lesson's own final real test can finally be written — the one real
invariant this entire Slice has been building toward since its own
very first lesson.

## Closing

### Connect the Pieces

The final real test this lesson adds:

```kotlin
private fun randomInvertibleDoubleMatrix(): Matrix<Double> {
    while (true) {
        val a = Random.nextInt(-10, 10).toDouble()
        val b = Random.nextInt(-10, 10).toDouble()
        val c = Random.nextInt(-10, 10).toDouble()
        val d = Random.nextInt(-10, 10).toDouble()
        val det = a * d - b * c
        if (det != 0.0) {
            return Matrix(listOf(listOf(a, b), listOf(c, d)))
        }
    }
}

@Test
fun multiplyingByItsOwnInverseReturnsIdentityForManyRandomMatrices() {
    repeat(100) {
        val a = randomInvertibleDoubleMatrix()

        val result = a.multiply(a.inverse())

        assertEquals(1.0, result[0, 0], 0.0001)
        assertEquals(0.0, result[0, 1], 0.0001)
        assertEquals(0.0, result[1, 0], 0.0001)
        assertEquals(1.0, result[1, 1], 0.0001)
    }
}
```

`randomInvertibleDoubleMatrix` uses a real `while (true)` loop — a
construct this project's own earlier work has used before — trying
fresh random values and looping again only on the rare real occasion a
random determinant lands on exactly `0.0` (a singular matrix, with no
real inverse at all), never returning until it holds a matrix `inverse()`
can genuinely handle. `multiplyingByItsOwnInverseReturnsIdentityForManyRandomMatrices`
combines every real technique this lesson built: `repeat(100)`,
property-based testing's own real trial count; a fresh random,
guaranteed-invertible `Matrix<Double>` each time; `a.multiply(a.inverse())`,
the real `Matrix<Double>.multiply` this lesson's own third unit just
fixed a genuine JVM collision to build at all; and, in place of a plain
`assertEquals`, four real, tolerance-based comparisons — the three-argument
`assertEquals(expected, actual, delta)` overload documented in the
Header — because this session's own real, executed check (five concrete
`2×2` examples, computed by hand) already proved plain `Double`
arithmetic doesn't always land on an exact `1.0`/`0.0`, the same real
category of floating-point imprecision this project's own earlier
scientific-function work already proved for `sin(180°)`.

One concrete real trial, traced through the whole real chain: a real,
random `Matrix<Double>` — say, `[[4.0, 3.0], [2.0, 1.0]]`, this Slice's
own now-familiar real example — real determinant `-2.0`, confirmed
nonzero, so `randomInvertibleDoubleMatrix` accepts it; `.inverse()`
reaches the real, permanent formula this project's own earlier work
proved correct, returning `[[-0.5, 1.5], [1.0, -2.0]]`; `.multiply(...)`
reaches this lesson's own brand-new `Matrix<Double>.multiply`, computing
a real dot product per cell; the real result, confirmed by this
project's own real, executed check earlier this session, lands on
exactly `[[1.0, 0.0], [0.0, 1.0]]` for this specific pair — genuinely
exact, this time, though this lesson's own tolerance-based assertions
don't depend on that being true for every one of the `100` real random
trials, only close.

This project now has 78 real, passing tests — 74 carried over, plus
four new ones in `MatrixInvariantTest.kt`: the identity invariant, proven
across `100` random trials; addition's own commutativity, proven the
same way; multiplication's own real non-commutativity, proven with one
permanent counterexample; and the inverse invariant, proven across `100`
more random trials, each one a genuinely different, freshly-generated,
guaranteed-invertible real matrix. Real, verified via a full, clean
`./gradlew testDebugUnitTest assembleDebug` run (the same, already-
documented `AppNotIdleException` flake recurred once more on this
lesson's own first full-suite attempt — `HapticsTest`/`NavigationTest`×2/
`ThemeTest`, never anything Matrix-related — an immediate, unmodified
rerun passed clean, the same pattern as every earlier occurrence).

**🟢 Slice 8 (Matrix Calculator) shipped.** Seven real lessons, one real,
permanent `Matrix<T>` type — genuinely generic, validated at
construction, readable through a real two-parameter operator, combinable
through a real Strategy-pattern interface, buildable by name through a
real Factory-pattern companion object, and, as of this lesson, tested
not just for individual correctness but for the real mathematical laws
it's supposed to obey. Every real operation the BRD's own Slice 8 plan
named — `add`, `subtract`, `multiply`, `transpose`, `determinant`, and,
closing a real, long-open promise, `inverse` — is real, permanent,
and tested. **Next:** Stage 9 turns to graphing — plotting `y = f(x)` by
sampling, this project's own next real feature, starting from a
genuinely different kind of problem than anything Stage 8 needed.
