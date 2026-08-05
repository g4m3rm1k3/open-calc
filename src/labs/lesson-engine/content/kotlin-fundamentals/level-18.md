---
series: kotlin-fundamentals
level: 18
title: Operator Overloading
lang: kotlin
---

# Operator Overloading

`java-fundamentals` Level 0 mentioned, in passing, that Java hard-codes `+` for string concatenation as a special case the language itself controls — ordinary Java classes cannot define what `+` means for their own instances at all. Kotlin opens that door, in a controlled, explicit way: a small set of specifically-named functions, marked with the `operator` keyword, let your own types respond to `+`, `-`, `*`, `==`, `[]`, and more.

## Defining + for a Custom Type

```kotlin
data class Point(val x: Int, val y: Int) {
    operator fun plus(other: Point): Point {
        return Point(x + other.x, y + other.y)
    }
}

fun main() {
    val a = Point(1, 2)
    val b = Point(3, 4)

    val c = a + b
    println(c)
}
```

```text
Point(x=4, y=6)
```

**Walkthrough:** `operator fun plus(other: Point): Point` defines what `+` means between two `Point`s — the `operator` keyword is required; without it, this would just be an ordinary method named `plus`, callable only as `a.plus(b)`, not through `+` at all. `a + b` is exactly equivalent to `a.plus(b)` — the compiler translates the operator syntax into that method call directly, at compile time, with zero runtime overhead beyond an ordinary function call.

**CS lens:** This is **operator overloading**: giving an existing operator symbol new meaning for a specific type, decided by that type's own author. Kotlin restricts this to a small, fixed set of operator names (`plus`, `minus`, `times`, `div`, `compareTo`, `equals`, `get`, `set`, and a handful more) — you cannot invent an entirely new operator symbol, only redefine what the existing ones mean for your own types. This is deliberately more conservative than C++'s operator overloading (which allows overloading nearly any operator, including ones like `->` and `()`, and has a long history of being used to write genuinely confusing code) — Kotlin's smaller, fixed vocabulary keeps `+` recognizable as "combine these two things" no matter which type defines it.

## A Small Vocabulary of Operators

```kotlin
data class Money(val cents: Int) {
    operator fun plus(other: Money) = Money(cents + other.cents)
    operator fun minus(other: Money) = Money(cents - other.cents)
    operator fun times(factor: Int) = Money(cents * factor)
    operator fun compareTo(other: Money) = cents.compareTo(other.cents)

    override fun toString() = "$${cents / 100}.${(cents % 100).toString().padStart(2, '0')}"
}

fun main() {
    val price = Money(1999)      // $19.99
    val tax = Money(160)          // $1.60
    val total = price + tax

    println(total)
    println(price * 3)
    println(price > tax)
}
```

```text
$21.59
$59.97
true
```

**Walkthrough:** `operator fun compareTo(other: Money): Int` — returning negative/zero/positive, exactly like Java's own `Comparable.compareTo` — is what makes `price > tax` legal: Kotlin translates every comparison operator (`<`, `>`, `<=`, `>=`) into a call to `compareTo`, checking the sign of the result. `price * 3` calls the `times` operator, computing `1999 * 3 = 5997` cents, formatted as `$59.97`. `total`'s `1999 + 160 = 2159` cents formats as `$21.59` — `padStart(2, '0')` is what correctly keeps a remainder like `5` cents printing as `.05` rather than `.5`, which would silently misrepresent the amount.

**SE lens:** The `Money` class shows operator overloading's real value: `price + tax` reads immediately as "add these two amounts," while `price.plus(tax)` — though functionally identical — reads like an API call rather than the arithmetic it actually represents. This readability gain is exactly why operator overloading exists as a controlled feature rather than being banned outright (as some languages, including Go, choose to do): used for types that genuinely behave like numbers or collections, it makes code read the way the domain itself is naturally described.

## Indexed Access with get and set

```kotlin
class Grid(private val width: Int, private val height: Int) {
    private val cells = IntArray(width * height)

    operator fun get(x: Int, y: Int): Int = cells[y * width + x]
    operator fun set(x: Int, y: Int, value: Int) {
        cells[y * width + x] = value
    }
}

fun main() {
    val grid = Grid(3, 3)
    grid[1, 1] = 5     // calls set(1, 1, 5)
    grid[0, 0] = 9

    println(grid[1, 1])   // calls get(1, 1)
    println(grid[0, 0])
    println(grid[2, 2])
}
```

```text
5
9
0
```

**Walkthrough:** `operator fun get(x: Int, y: Int): Int` and `operator fun set(x: Int, y: Int, value: Int)` let `Grid` support `[ ]` indexing with **two** arguments, not just one — `grid[1, 1] = 5` calls `set(1, 1, 5)`; `grid[1, 1]` (read, not assigned) calls `get(1, 1)`. This is the exact same mechanism that makes `list[0]` work on Kotlin's own `List` and `map["key"]` work on `Map` (both from Level 6) — those aren't special-cased by the compiler at all; `List` and `Map` are ordinary classes (well, interfaces) that simply define `get` (and, for mutable variants, `set`) themselves, using precisely this feature.

## Recognition

```text
Today: operator overloading — plus, minus, times, compareTo, get, set

Also recognized in: C++'s operator+ and friends (Kotlin's most direct,
if more restrained, ancestor), Python's __add__/__eq__/__getitem__ dunder
methods (the same idea, different naming convention), Swift's static func
+ (Type, Type) -> Type, and C#'s public static operator + — all
languages that let user-defined types participate in the same operator
syntax built-in numeric types already enjoy.
```

## Challenge: vector2d

Write `data class Vector2D(val x: Double, val y: Double)` with:
- `operator fun plus(other: Vector2D): Vector2D`
- `operator fun minus(other: Vector2D): Vector2D`
- `operator fun times(scalar: Double): Vector2D`
- `fun magnitude(): Double` — returns `sqrt(x*x + y*y)` (use `kotlin.math.sqrt`)

```challenge
import kotlin.math.sqrt

data class Vector2D(val x: Double, val y: Double) {
    operator fun plus(other: Vector2D): Vector2D {
        return this
    }

    operator fun minus(other: Vector2D): Vector2D {
        return this
    }

    operator fun times(scalar: Double): Vector2D {
        return this
    }

    fun magnitude(): Double {
        return 0.0
    }
}
```

```test
val a = Vector2D(1.0, 2.0)
val b = Vector2D(3.0, 4.0)

assert (a + b) == Vector2D(4.0, 6.0)
assert (b - a) == Vector2D(2.0, 2.0)
assert (a * 2.0) == Vector2D(2.0, 4.0)

val unit = Vector2D(3.0, 4.0)
assert unit.magnitude() == 5.0
```
