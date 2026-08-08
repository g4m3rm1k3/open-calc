---
series: kotlin-fundamentals
level: 1
title: Control Flow
lang: kotlin
---

# Control Flow

Kotlin's control flow looks familiar coming from almost any C-family language — `if`, `for`, `while` are all here — but one change runs through all of it: in Kotlin, `if` is an **expression**, not just a statement. This lesson covers branching and looping, and the one difference that reshapes how idiomatic Kotlin code is actually written.

## if as a Statement — the Familiar Part

```kotlin
fun main() {
    val temperature = 15

    if (temperature > 25) {
        println("It's hot")
    } else if (temperature > 10) {
        println("It's mild")
    } else {
        println("It's cold")
    }
}
```

```text
It's mild
```

**Walkthrough:** This reads exactly like Java or C: `if (condition) { ... } else if (condition) { ... } else { ... }`, evaluated top to bottom, running the first branch whose condition is `true`. Nothing new here yet.

## if as an Expression — the Kotlin Part

```kotlin
fun main() {
    val temperature = 15

    // if PRODUCES a value here — assigned directly to a val.
    val description = if (temperature > 25) {
        "hot"
    } else if (temperature > 10) {
        "mild"
    } else {
        "cold"
    }

    println("It's $description")
}
```

```text
It's mild
```

**Walkthrough:** `val description = if (...) { "hot" } else if (...) { "mild" } else { "cold" }` assigns the *result* of the entire `if`/`else if`/`else` chain directly to `description` — the last expression evaluated inside whichever branch actually ran becomes the value of the whole `if`. Java has no equivalent to this; the closest Java gets is the ternary operator `condition ? a : b`, which only handles exactly two branches and cannot hold multiple statements.

**CS lens:** A **statement** performs an action and produces no value of its own (`if (x) { print(y) }` — this executes, but the `if` itself isn't "worth" anything). An **expression** evaluates to a value that can be used elsewhere (`5 + 3` is worth `8`). By making `if` an expression, Kotlin lets you replace the common pattern "declare a variable, then conditionally assign it in every branch" — a pattern Java requires because Java's `if` is only ever a statement — with a single declaration whose value the `if` itself computes. Level 8 (`when` expressions) is Kotlin's other major use of this same idea, at a larger scale.

## Ranges and the for Loop

```kotlin
fun main() {
    for (i in 1..5) {
        print("$i ")
    }
    println()

    for (i in 1 until 5) {
        print("$i ")
    }
    println()

    for (i in 10 downTo 1 step 3) {
        print("$i ")
    }
    println()
}
```

```text
1 2 3 4 5 
1 2 3 4 
10 7 4 1
```

**Walkthrough:** `1..5` is a **range** — a real value (of type `IntRange`) representing every integer from `1` to `5`, inclusive of both ends. `for (i in 1..5)` iterates that range, binding `i` to each value in turn. `1 until 5` is the same idea but excludes the upper bound (`1, 2, 3, 4` — useful for zero-based indices, replacing Java's `for (int i = 0; i < n; i++)`). `10 downTo 1 step 3` counts backward from `10` to `1`, moving `3` at a time (`10, 7, 4, 1`). Kotlin's `for` loop only ever iterates something iterable — a range, a collection (Level 6), a string's characters — there is no C-style `for (int i = 0; i < n; i++)` form in Kotlin at all, because ranges cover the same need more safely: an off-by-one error in a hand-written loop condition (`i <= n` vs `i < n`) simply cannot happen when the range itself states its own bounds.

## while and do-while

```kotlin
fun main() {
    var count = 3
    while (count > 0) {
        println("Countdown: $count")
        count--
    }

    var attempts = 0
    do {
        attempts++
        println("Attempt $attempts")
    } while (attempts < 2)
}
```

```text
Countdown: 3
Countdown: 2
Countdown: 1
Attempt 1
Attempt 2
```

**Walkthrough:** `while (condition) { ... }` checks the condition before every iteration, including the first — if `count` had started at `0`, the loop body would never run at all. `do { ... } while (condition)` checks the condition *after* the body runs, guaranteeing the body executes at least once regardless of the condition's initial value — visible here in `attempts` starting at `0` and the loop still running (twice, since the condition is re-checked after each pass and `attempts < 2` is still true after the first).

## Breaking Out and Skipping Ahead

```kotlin
fun main() {
    for (i in 1..10) {
        if (i == 4) continue   // skip this iteration, move to the next
        if (i == 7) break      // exit the loop entirely
        print("$i ")
    }
    println()
}
```

```text
1 2 3 5 6
```

**Walkthrough:** The loop prints `1 2 3`, then hits `i == 4` and `continue` skips printing `4` but keeps looping — `5 6` print normally — then hits `i == 7` and `break` exits the loop immediately, so `7 8 9 10` never run at all. Both keywords work exactly as they do in Java and C; nothing Kotlin-specific here, included for completeness before ranges and `when` take over most of the branching logic in idiomatic Kotlin code.

## Recognition

```text
Today: if as an expression — branches that produce a value directly

Also recognized in: Rust's if/else (also an expression, same reasoning),
Ruby's if/unless (both expressions), Scala's if/else, and even C's much
narrower ternary a ? b : c — Kotlin's if-as-expression is really the
ternary operator generalized to handle any number of branches and any
number of statements per branch, instead of being a special, separate
piece of syntax.
```

## Challenge: grade_calculator

Write `fun letterGrade(score: Int): String` using `if` as an expression (a single `if`/`else if`/`else` chain whose result is returned directly, not multiple separate `return` statements). Rules: `90` and above is `"A"`, `80`–`89` is `"B"`, `70`–`79` is `"C"`, below `70` is `"F"`.

```challenge
fun letterGrade(score: Int): String {
    return ""
}
```

```test
assert letterGrade(95) == "A"
assert letterGrade(82) == "B"
assert letterGrade(71) == "C"
assert letterGrade(50) == "F"
assert letterGrade(90) == "A"
assert letterGrade(69) == "F"
```
