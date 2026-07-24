# Lesson 17: One Symbol, Two Different Jobs

*(Matrix Multiply and Determinant)*

**User Story**
> As a user, I want to multiply two 2×2 matrices, apply a matrix to a
> vector, and see a matrix's determinant.

**What you will build**
`Matrix2` added alongside Lesson 16's `Vector2`, with `×` correctly meaning
two different things depending on what's on the right-hand side, plus a
determinant calculation.

**What you need to know first**
Lesson 16's `Vector2` and `operator fun`.

---

## Concept Unit: Overload Resolution — Same Operator, Different Signature

### The Problem

`×` should mean "combine two matrices into one" when multiplying two
matrices, but "apply this transform to a point" when multiplying a matrix
by a vector — genuinely different operations that happen to share one
symbol in standard mathematical notation.

### Introduce the concept in isolation

```kotlin
data class Vector2(val x: Double, val y: Double)

data class Matrix2(val a: Double, val b: Double, val c: Double, val d: Double) {
    operator fun times(other: Matrix2): Matrix2 = Matrix2(
        a * other.a + b * other.c, a * other.b + b * other.d,
        c * other.a + d * other.c, c * other.b + d * other.d
    )
    operator fun times(v: Vector2): Vector2 = Vector2(a * v.x + b * v.y, c * v.x + d * v.y)
    fun determinant(): Double = a * d - b * c
}

val identity = Matrix2(1.0, 0.0, 0.0, 1.0)
val scale2x = Matrix2(2.0, 0.0, 0.0, 2.0)
println(identity * scale2x)
println(scale2x * Vector2(3.0, 4.0))
println(scale2x.determinant())

val singular = Matrix2(2.0, 4.0, 1.0, 2.0)
println(singular.determinant())
```

Run it:

```bash
kotlin matrix.kts
```

Real output — verified this session:

```text
Matrix2(a=2.0, b=0.0, c=0.0, d=2.0)
Vector2(x=6.0, y=8.0)
4.0
0.0
```

*What this proves:* `identity * scale2x` (a `Matrix2` on the right)
correctly called the *first* `times` overload and returned another
`Matrix2` — the identity matrix composed with anything returns that
anything unchanged. `scale2x * Vector2(3.0, 4.0)` (a `Vector2` on the
right) correctly called the *second* overload and returned a scaled
`Vector2((3,4) → (6,8))` — the compiler picked the right one automatically
based on the argument's actual type, with no ambiguity at the call site.
`singular.determinant()` returning exactly `0.0` is a real, meaningful
result, not a coincidence: `singular`'s second row `(1, 2)` is exactly half
its first row `(2, 4)` — the two rows are **linearly dependent**, which
Lesson 18 shows is precisely the condition that makes a linear system have
no unique solution.

### Discard the throwaway example

Deleted. `Matrix2` moves into the real `LinearAlgebra.kt` file alongside
`Vector2`.

### Mechanical walkthrough

1. `operator fun times(other: Matrix2): Matrix2` / `operator fun times(v: Vector2): Vector2`
   — (first appearance) **operator overloading combined with function
   overloading** — two functions, same name (`times`), differing only in
   parameter type. Kotlin (like Java, for ordinary functions) allows this,
   and the compiler resolves which one applies purely from the argument's
   static type at each call site — `scale2x * Vector2(...)` can only match
   the second signature, so that's the one that runs.
2. `a * other.a + b * other.c` (and the three similar terms) — this is
   standard 2×2 matrix multiplication, each output cell computed as a dot
   product of a row from the left matrix and a column from the right —
   ordinary arithmetic, no new Kotlin syntax; the row/column bookkeeping is
   the actual content worth being careful with, not the code shape.
3. `a * d - b * c` — the standard 2×2 determinant formula.

### CS Lens

This is **function overloading applied to an operator** — the same broad
mechanism Java has always had for ordinary methods (multiple `print`
overloads, for instance), here extended to operator symbols specifically
because Kotlin allows `operator fun` to participate in it exactly like any
other function name.

### SE Lens

The real risk overload resolution introduces: with two `times` overloads,
a reader has to check *which* argument type is present to know what a
given `*` call actually computes — worth it here because both operations
are genuinely, unambiguously "multiplication" in the mathematical sense a
reader already expects, unlike a hypothetical case where two overloads of
the same operator name computed conceptually unrelated things.

### Connection

Lesson 18 uses `determinant()` directly to detect whether a linear system
even has a unique solution before attempting to solve it — `0.0` here
wasn't a coincidence, it's the exact condition Lesson 18 checks for.

---

## Closing

### Connect the pieces

Two `operator fun times` overloads (unit 1) give `Matrix2` correct,
type-safe multiplication against both another `Matrix2` and a `Vector2`,
resolved automatically by argument type. `determinant()` computes a single
number characterizing the matrix — verified here to be exactly `0.0` for a
matrix with linearly dependent rows, the exact fact Lesson 18 needs next.

### What breaks without this

Delete the `Vector2`-taking `times` overload, keeping only the
`Matrix2`-taking one. Try to compile `scale2x * Vector2(3.0, 4.0)`. Real,
observable failure: a compile error stating no applicable `times` overload
matches a `Vector2` argument — the compiler does not attempt any implicit
conversion to make the remaining overload fit. Restore the second overload
and it compiles again.

### Exercises

- Verify by hand (or by running it) that `scale2x * identity` gives the
  same result as `identity * scale2x` for this specific pair — then look
  up why matrix multiplication is *not* commutative in general and confirm
  with two matrices that don't happen to share this special case.
- Add a `transpose()` function (swap `b` and `c`) and confirm
  `determinant()` is unchanged by it — a real, checkable property of
  determinants.

### Definition of done

- [ ] Matrix × Matrix and Matrix × Vector both compute correctly.
- [ ] `determinant()` correctly returns `0.0` for a singular matrix.
- [ ] You can explain, concretely, how the compiler picks which `times`
      overload applies at a given call site.
- [ ] Commit: `git commit -m "Add Matrix2 with overloaded multiplication and determinant"`.
