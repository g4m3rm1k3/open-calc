---
series: kotlin-fundamentals
level: 9
title: when Expressions
lang: kotlin
---

# when Expressions

Java's `switch` statement — even its modernized `switch` expression form — is built around matching a value against a fixed set of constants. Kotlin's `when` replaces `switch` entirely, but is considerably more powerful: its branches can be arbitrary conditions, ranges, type checks, or multiple values at once, and — following Level 1's `if`-as-expression pattern — `when` itself can produce a value directly.

## when as a Statement, Matching Exact Values

```kotlin
fun main() {
    val day = 3

    when (day) {
        1 -> println("Monday")
        2 -> println("Tuesday")
        3 -> println("Wednesday")
        4 -> println("Thursday")
        5 -> println("Friday")
        else -> println("Weekend")
    }
}
```

```text
Wednesday
```

**Walkthrough:** `when (day) { 1 -> ...; 2 -> ...; else -> ... }` compares `day` against each branch in order, running the first one that matches — no `break` statement anywhere, unlike Java's `switch`, where forgetting `break` lets execution silently "fall through" into the next case. Kotlin's `when` never falls through; each branch is independent. `else` catches every value not explicitly listed above it, exactly like Java's `default`.

## when as an Expression

```kotlin
fun main() {
    val day = 3

    val dayName = when (day) {
        1 -> "Monday"
        2 -> "Tuesday"
        3 -> "Wednesday"
        4 -> "Thursday"
        5 -> "Friday"
        else -> "Weekend"
    }

    println(dayName)
}
```

```text
Wednesday
```

**Walkthrough:** Exactly like `if` in Level 1, `when` can be assigned directly to a `val` — `dayName` becomes whichever branch's result actually ran. When `when` is used as an expression like this, the compiler requires the branches to be **exhaustive** — every possible input must be covered, usually by including an `else` branch, or the code simply won't compile. This is a real, compiler-enforced guarantee: a `when` expression can never silently produce nothing at all, the way a Java `switch` statement can fall through every `case` and hit no `default`.

**CS lens:** Exhaustiveness checking is the compiler proving, before the program ever runs, that every input to this branch has a defined output. Level 13 (Sealed Classes) returns to this exact guarantee at its strongest: a `when` over a `sealed class` hierarchy can be checked exhaustively *without needing an `else` branch at all*, because the compiler knows the complete, closed list of possible subtypes.

## Matching Multiple Values, Ranges, and Conditions

```kotlin
fun main() {
    val score = 85

    val grade = when (score) {
        in 90..100 -> "A"                          // range check
        in 80..89 -> "B"
        in 70..79 -> "C"
        else -> "F"
    }
    println(grade)

    val number = 7
    val description = when {                        // no subject at all — each branch is its own condition
        number < 0 -> "negative"
        number == 0 -> "zero"
        number % 2 == 0 -> "positive even"
        else -> "positive odd"
    }
    println(description)

    val x = 3
    when (x) {
        1, 2, 3 -> println("small")                  // comma matches ANY of these values
        4, 5, 6 -> println("medium")
        else -> println("large")
    }
}
```

```text
B
positive odd
small
```

**Walkthrough:** `in 90..100 -> "A"` reuses Level 1's range syntax directly inside a `when` branch — `score in 90..100` is checked as a whole condition, matching if `score` falls anywhere in that range. `when { ... }` with **no subject in parentheses** turns every branch into its own independent boolean condition, checked top to bottom exactly like an `if`/`else if` chain — this is the form used when there's no single value to compare against, only a series of unrelated conditions. `1, 2, 3 -> println("small")` matches if `x` equals *any* of the comma-separated values — Java's `switch` supports this too (`case 1: case 2: case 3:`), but only by relying on fall-through; Kotlin states it directly as one branch.

**SE lens:** The range-based grade calculator here does exactly what Level 1's `if`/`else if` challenge did, in a form that reads closer to a specification table than a chain of comparisons — each branch states its own condition and result on one line, rather than nesting deeper with every additional case.

## Recognition

```text
Today: when as an expression, range/multi-value/no-subject matching, exhaustiveness

Also recognized in: Rust's match (also exhaustive by compiler requirement,
also an expression), Swift's switch (also no fall-through by default — a
change Swift made specifically citing this exact C/Java footgun), Scala's
match, and Java's own switch expression (added in Java 14, years after
Kotlin, adopting the same no-fall-through, produces-a-value shape).
```

## Challenge: shipping_cost

Write `fun shippingCost(weightKg: Double, isExpress: Boolean): Double` using a subject-less `when` expression (`when { condition -> result; ... }`, not `if`/`else if`) with these tiers: `weightKg <= 1.0` costs `5.0`, `weightKg <= 5.0` costs `10.0`, anything heavier costs `20.0`. If `isExpress` is `true`, double whatever the base cost is before returning it.

```challenge
fun shippingCost(weightKg: Double, isExpress: Boolean): Double {
    return 0.0
}
```

```test
assert shippingCost(0.5, false) == 5.0
assert shippingCost(3.0, false) == 10.0
assert shippingCost(7.0, false) == 20.0
assert shippingCost(0.5, true) == 10.0
assert shippingCost(7.0, true) == 40.0
assert shippingCost(1.0, false) == 5.0
```
