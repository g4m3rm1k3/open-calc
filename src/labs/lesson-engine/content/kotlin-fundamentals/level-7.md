---
series: kotlin-fundamentals
level: 7
title: Lambdas & Higher-Order Functions
lang: kotlin
---

# Lambdas & Higher-Order Functions

`java-fundamentals` Level 14 taught lambdas as a way to implement a **functional interface** — an interface with exactly one abstract method — because that's the only place Java allows a function-like value to exist at all. Kotlin has no such restriction: functions are values in their own right, storable in a `val`, passable as an argument, returnable from another function, with no interface required anywhere. This lesson builds that up from first principles.

## A Function Type, as a Real Type

```kotlin
fun main() {
    // (Int, Int) -> Int is a TYPE: "a function taking two Ints, returning an Int"
    val add: (Int, Int) -> Int = { a, b -> a + b }

    println(add(3, 4))
    println(add(10, -2))
}
```

```text
7
8
```

**Walkthrough:** `(Int, Int) -> Int` is a **function type** — read it as "a function that takes an `Int` and an `Int`, and returns an `Int`." `{ a, b -> a + b }` is a **lambda expression**: the part before `->` names the parameters, the part after is the function's body — `add`'s value is the lambda itself, not the result of calling it. `add(3, 4)` then calls it exactly like an ordinary function, because as far as the rest of the program is concerned, it is one — `add` is simply a `val` whose value happens to be executable.

**CS lens:** This is what "**functions are first-class values**" means concretely: a function can be assigned to a variable, passed around, and called later, with the same freedom as an `Int` or a `String`. Java's lambdas achieve something similar, but only by secretly implementing a functional interface behind the scenes (`Function<Integer, Integer>`, say) — the interface is still there, just hidden. Kotlin's function types are a real, first-class part of the type system, with no interface standing in for them.

## Passing a Function as an Argument

```kotlin
fun applyTwice(x: Int, operation: (Int) -> Int): Int {
    return operation(operation(x))
}

fun main() {
    val double: (Int) -> Int = { n -> n * 2 }
    println(applyTwice(3, double))

    val addTen: (Int) -> Int = { n -> n + 10 }
    println(applyTwice(3, addTen))
}
```

```text
12
23
```

**Walkthrough:** `applyTwice(x: Int, operation: (Int) -> Int): Int` takes a function as its second parameter — `operation`'s type is `(Int) -> Int`, meaning `applyTwice` doesn't know or care *what* the operation does, only its shape. `operation(operation(x))` calls whatever function was passed in, twice, feeding the first call's result into the second. `applyTwice(3, double)` runs `double(double(3))` = `double(6)` = `12`; `applyTwice(3, addTen)` runs `addTen(addTen(3))` = `addTen(13)` = `23`. `applyTwice` itself never changes between these two calls — only the function value passed to it does.

**SE lens:** A function that takes another function as a parameter, or returns one, is called a **higher-order function**. This is precisely the mechanism behind `java-architecture`'s Strategy pattern (Level 4 of that series) — `PaymentProcessor.process(strategy, amount)` took an interface implementation to select behavior at the call site. `applyTwice(x, operation)` accomplishes the identical goal — swap in different behavior without editing the function that uses it — with a plain function value instead of a whole interface and a family of implementing classes.

## Trailing Lambda Syntax

```kotlin
fun applyTwice(x: Int, operation: (Int) -> Int): Int {
    return operation(operation(x))
}

fun main() {
    // When a lambda is the LAST argument, it can move outside the parentheses:
    val result = applyTwice(5) { n -> n * n }
    println(result)

    // If a lambda takes exactly one parameter, "it" refers to that parameter implicitly:
    val result2 = applyTwice(5) { it * it }
    println(result2)
}
```

```text
625
625
```

**Walkthrough:** `applyTwice(5) { n -> n * n }` is exactly equivalent to `applyTwice(5, { n -> n * n })` — when a function's *last* parameter is itself a function, Kotlin lets the lambda move outside the parentheses entirely, reading almost like a built-in control-flow keyword with a block attached. `applyTwice(5) { it * it }` goes one step further: for a lambda with exactly one parameter, naming it explicitly (`n ->`) is optional — `it` refers to that single parameter automatically. This trailing-lambda convention is why Kotlin standard-library functions like `let` (Level 3), and every collection operation Level 8 covers next, read the way they do — `{ ... }` directly after a function call, no visible parentheses at all.

## Returning a Function from a Function

```kotlin
fun makeMultiplier(factor: Int): (Int) -> Int {
    return { n -> n * factor }
}

fun main() {
    val triple = makeMultiplier(3)
    val double = makeMultiplier(2)

    println(triple(7))
    println(double(7))
}
```

```text
21
14
```

**Walkthrough:** `makeMultiplier(factor: Int): (Int) -> Int` returns a function type, not a plain value — calling `makeMultiplier(3)` produces a new function that remembers `factor = 3` and multiplies whatever it's later called with by that number. `triple(7)` calls the function `makeMultiplier(3)` returned, computing `7 * 3 = 21`; `double`, built from `makeMultiplier(2)`, computes `7 * 2 = 14` from the same call shape. The returned lambda `{ n -> n * factor }` **captures** `factor` from the outer function's scope — this is a **closure**, the same concept `java-fundamentals` and `javascript-fundamentals` both cover: a function that remembers the variables that were in scope where it was created, even after that outer function has already returned.

## Recognition

```text
Today: function types, lambdas, higher-order functions, closures

Also recognized in: JavaScript's functions-as-values (the language Kotlin's
approach most closely resembles — no interface wrapper needed there
either), Python's functions and lambda keyword, Swift's closures (near-
identical trailing-closure syntax to Kotlin's trailing lambda), and Java's
own java.util.function.Function<T,R> interface — the thing Kotlin's
function types replace, from Level 14 of java-fundamentals.
```

## Challenge: function_composer

Write `fun compose(f: (Int) -> Int, g: (Int) -> Int): (Int) -> Int` that returns a new function computing `f(g(x))` for whatever `x` the returned function is eventually called with — this is function composition: apply `g` first, then `f` to its result.

```challenge
fun compose(f: (Int) -> Int, g: (Int) -> Int): (Int) -> Int {
    return { x -> x }
}
```

```test
val double: (Int) -> Int = { it * 2 }
val addOne: (Int) -> Int = { it + 1 }

val doubleThenAddOne = compose(addOne, double)
assert doubleThenAddOne(5) == 11

val addOneThenDouble = compose(double, addOne)
assert addOneThenDouble(5) == 12

val square: (Int) -> Int = { it * it }
val squareThenDouble = compose(double, square)
assert squareThenDouble(3) == 18
assert squareThenDouble(4) == 32
```
