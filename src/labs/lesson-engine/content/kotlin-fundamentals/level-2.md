---
series: kotlin-fundamentals
level: 2
title: Functions
lang: kotlin
---

# Functions

Functions in Kotlin carry the same reduction in ceremony that variables did in Level 0 — but they also add real capabilities Java's methods don't have at all: default parameter values and named arguments chief among them. This lesson covers how to declare, call, and design functions the idiomatic Kotlin way.

## Basic Function Syntax

```kotlin
fun greet(name: String): String {
    return "Hello, $name!"
}

fun main() {
    val message = greet("Kotlin")
    println(message)
}
```

```text
Hello, Kotlin!
```

**Walkthrough:** `fun greet(name: String): String { ... }` declares a function named `greet` taking one parameter `name` of type `String`, returning a `String`. Every parameter's type must be written explicitly (unlike `val`, Kotlin does not infer parameter types from how a function is called — there'd be nothing to infer *from* until every call site existed). The return type after the `)` is likewise required whenever the function's body is a `{ }` block, though the next example shows a case where even that becomes unnecessary.

## Single-Expression Functions

```kotlin
fun square(n: Int): Int {
    return n * n
}

// The exact same function, written as a single expression:
fun cube(n: Int) = n * n * n

fun main() {
    println(square(5))
    println(cube(3))
}
```

```text
25
27
```

**Walkthrough:** `fun cube(n: Int) = n * n * n` is a **single-expression function**: when a function's entire body is one expression, `= expression` replaces `{ return expression }` — no braces, no `return` keyword, no explicit return type at all (Kotlin infers `Int` here from `n * n * n`, since `n` is `Int` and multiplying `Int`s produces an `Int`). This isn't a different kind of function — `cube` and `square` compile to the identical thing — it's purely a shorter way to write a function whose whole job is "compute one value and return it," which describes a large fraction of the small functions in any real codebase.

**SE lens:** Single-expression syntax is a genuine readability signal, not just brevity for its own sake: seeing `fun cube(n: Int) = n * n * n` tells a reader, at a glance, "this function has no loops, no branches, no side effects — it's pure computation" before they've read a single character of the body. A function that *needs* the full `{ }` block form is announcing it does something more involved.

## Default Parameter Values

```kotlin
fun greet(name: String, greeting: String = "Hello"): String {
    return "$greeting, $name!"
}

fun main() {
    println(greet("Alice"))                    // uses the default greeting
    println(greet("Bob", "Welcome"))            // overrides the default
}
```

```text
Hello, Alice!
Welcome, Bob!
```

**Walkthrough:** `greeting: String = "Hello"` gives `greeting` a **default value** — if a call to `greet` omits that argument, `"Hello"` is used automatically. `greet("Alice")` supplies only `name`, so `greeting` falls back to its default; `greet("Bob", "Welcome")` supplies both, overriding it. Java has no equivalent — the closest Java gets is **method overloading**, writing `greet(String name)` *and* `greet(String name, String greeting)` as two entirely separate methods, one of which just calls the other with a hardcoded default. Kotlin's default parameters replace that whole family of overloads with one function.

## Named Arguments

```kotlin
fun createUser(name: String, age: Int, isAdmin: Boolean = false, isVerified: Boolean = false) {
    println("$name, age $age, admin=$isAdmin, verified=$isVerified")
}

fun main() {
    // Positional — must match declaration order exactly:
    createUser("Alice", 30)

    // Named — order doesn't matter, and intent is unambiguous at the call site:
    createUser(name = "Bob", age = 25, isVerified = true)
    createUser(age = 40, name = "Carol", isAdmin = true)
}
```

```text
Alice, age 30, admin=false, verified=false
Bob, age 25, admin=false, verified=true
Carol, age 40, admin=true, verified=false
```

**Walkthrough:** `createUser(name = "Bob", age = 25, isVerified = true)` calls `createUser` using **named arguments** — writing `parameterName = value` for each argument instead of relying on position. This does two things at once: it lets you skip `isAdmin` (using its default `false`) while still supplying `isVerified`, which positional-only calling could never do (you'd have to pass *something* for every parameter before the one you actually want to set); and it makes the call self-documenting — `createUser("Bob", 25, false, true)` forces a reader to go check the function signature to know what `false` and `true` mean, while `isVerified = true` needs no lookup at all. This directly answers Level 7's telescoping-constructor problem from `java-architecture`, without needing a separate `Builder` class to get there.

**SE lens:** Named arguments plus default parameters together mean Kotlin functions rarely need the overloaded-constructor or Builder-pattern workarounds Java relies on for the same problem — the language itself absorbs what used to require a whole extra class.

## Recognition

```text
Today: default parameters and named arguments

Also recognized in: Python's def f(x, y=10) and f(y=5, x=1) (nearly
identical syntax and semantics), C#'s optional/named parameters (added in
C# 4.0 specifically to reduce the same Java-style overload explosion),
and Swift's default parameter values — all designed to solve the exact
telescoping-constructor problem Level 7 of java-architecture used a whole
Builder class to work around.
```

## Challenge: order_summary

Write `fun orderSummary(item: String, quantity: Int = 1, giftWrapped: Boolean = false): String` returning exactly: `"QUANTITYx ITEM (gift wrapped)"` if `giftWrapped` is `true`, otherwise `"QUANTITYx ITEM"` — for example, `orderSummary("Widget", 3)` returns `"3x Widget"`, and `orderSummary("Widget", 2, true)` returns `"2x Widget (gift wrapped)"`.

```challenge
fun orderSummary(item: String, quantity: Int = 1, giftWrapped: Boolean = false): String {
    return ""
}
```

```test
assert orderSummary("Widget") == "1x Widget"
assert orderSummary("Widget", 3) == "3x Widget"
assert orderSummary("Widget", 2, true) == "2x Widget (gift wrapped)"
assert orderSummary(item = "Gadget", giftWrapped = true) == "1x Gadget (gift wrapped)"
assert orderSummary(quantity = 5, item = "Gizmo") == "5x Gizmo"
```
