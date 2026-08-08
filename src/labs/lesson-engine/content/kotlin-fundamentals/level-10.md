---
series: kotlin-fundamentals
level: 10
title: Extension Functions
lang: kotlin
---

# Extension Functions

In Java, if you want a new method on `String` — say, checking whether it's a valid email — you have exactly two choices: write a static utility method (`StringUtils.isValidEmail(str)`, called awkwardly from outside) or extend the class (which you can't, because `String` is `final`). Kotlin adds a third option that reads like neither: an **extension function**, which adds a genuinely new method to an existing type — including types you don't own and can't modify — called with ordinary dot syntax, as if it had always been there.

## Adding a Method to a Type You Don't Own

```kotlin
// This adds a real .isValidEmail() method to String — a type Kotlin itself defines.
fun String.isValidEmail(): Boolean {
    return this.contains("@") && this.contains(".")
}

fun main() {
    val email = "alice@example.com"
    val notAnEmail = "not an email"

    println(email.isValidEmail())
    println(notAnEmail.isValidEmail())
}
```

```text
true
false
```

**Walkthrough:** `fun String.isValidEmail(): Boolean` declares an extension function — `String` before the dot is the **receiver type**, the type being extended. Inside the function body, `this` refers to the actual `String` the method was called on (`"alice@example.com"` when called as `email.isValidEmail()`), exactly like `this` inside an ordinary method of a class you wrote yourself. `email.isValidEmail()` reads and calls exactly like a real, built-in method — there is nothing about the call site that reveals `isValidEmail` isn't part of `String`'s own original definition.

**CS lens:** This is **not** actually modifying `String`'s own class definition — the JVM class file for `String` is completely unchanged, and no existing Java code that already uses `String` is affected in any way. An extension function compiles down to an ordinary static method (`StringExtensionsKt.isValidEmail(email)`, roughly) that takes the receiver as its hidden first argument — `email.isValidEmail()` is genuinely syntactic sugar for exactly that static call. The "extension" is purely at the level of what you're *allowed to write and call*, not a runtime change to the type itself.

## Extension Functions on Your Own Types

```kotlin
data class ShoppingCart(val items: List<Double>)

// Extending a type from earlier in THIS series, not just a built-in type.
fun ShoppingCart.total(): Double {
    return this.items.sum()
}

fun ShoppingCart.isEmpty(): Boolean {
    return this.items.isEmpty()
}

fun main() {
    val cart = ShoppingCart(listOf(20.0, 5.5, 12.0))
    println(cart.total())
    println(cart.isEmpty())

    val empty = ShoppingCart(emptyList())
    println(empty.isEmpty())
}
```

```text
37.5
false
true
```

**Walkthrough:** `fun ShoppingCart.total(): Double` extends `ShoppingCart` — a `data class` defined two lines earlier in this same file — exactly the way `String.isValidEmail` extended a built-in type. `this.items.sum()` uses `sum()`, a standard-library extension function on `List<Double>` (the exact same mechanism, already at work in the standard library itself) that adds every element together. This raises a real design question: why isn't `total()` just a method defined *inside* `ShoppingCart` directly, the ordinary way `java-architecture`'s classes defined their own methods?

**SE lens:** The choice is about **where behavior should live relative to core data**. A method inside `ShoppingCart` itself is part of its essential, permanent contract — every consumer of `ShoppingCart` has to think about it. An extension function like `total()` is a *derived convenience*, defined separately, that can live in whichever file actually needs it — a checkout module might define `ShoppingCart.total()`, while a completely unrelated analytics module could define its own `ShoppingCart.averageItemPrice()`, without either module needing to touch `ShoppingCart`'s own original file at all. This is a direct, lighter-weight relative of the **Open/Closed Principle** `java-architecture` built entire patterns around (Strategy in Level 4, Repository in Level 2): `ShoppingCart` stays closed to modification, while new, unrelated behavior stays open to addition, in as many separate files as needed.

## Extension Functions Can't Access Private State

```kotlin
class BankAccount(private val balance: Double) {
    fun publicBalance(): Double = balance   // fine — inside the class, private is visible
}

// fun BankAccount.doubleBalance(): Double = balance * 2  // WOULD NOT COMPILE:
// extension functions can only see a type's PUBLIC members, never its private ones.

fun BankAccount.doubleBalance(): Double = publicBalance() * 2   // must go through a public method

fun main() {
    val account = BankAccount(100.0)
    println(account.doubleBalance())
}
```

```text
200.0
```

**Walkthrough:** The commented-out line would fail to compile, because `balance` is `private` — visible only to code physically inside `BankAccount`'s own class body, and an extension function, despite reading like a method call, is really just a specially-formatted external function (per the CS lens above), with no more access to `BankAccount`'s private internals than any other outside code has. `doubleBalance()` works only because it goes through `publicBalance()` — a real, public method `BankAccount` itself chose to expose.

**SE lens:** This is not a limitation to work around — it's encapsulation (Level 4's core idea) staying intact. If extension functions *could* reach private state, any file anywhere in a codebase could reach into any class's private internals just by declaring the right extension function, which would make `private` meaningless as a guarantee. Extension functions add convenience on top of a class's public surface; they can never widen that surface from the outside.

## Recognition

```text
Today: extension functions — adding methods to types without modifying them

Also recognized in: C#'s extension methods (this string s syntax — Kotlin's
closest and most direct ancestor for this exact feature), Swift's
extension Type { } blocks, and Ruby's open classes (which take this idea
much further, allowing genuine runtime modification of a class's real
definition — Kotlin deliberately stops short of that, for the encapsulation
reasons above).
```

## Challenge: list_extensions

Write two extension functions on `List<Int>`:
- `fun List<Int>.secondLargest(): Int?` — returns the second-largest distinct value in the list, or `null` if the list has fewer than two distinct values (hint: sort descending, remove duplicates, then check the second element)
- `fun List<Int>.average2(): Double` — returns the average of all elements as a `Double`, or `0.0` for an empty list (do not use the standard library's own `.average()` — compute it from `.sum()` and `.size`)

```challenge
fun List<Int>.secondLargest(): Int? {
    return null
}

fun List<Int>.average2(): Double {
    return 0.0
}
```

```test
assert listOf(5, 3, 9, 1).secondLargest() == 5
assert listOf(5, 5, 5).secondLargest() == null
assert listOf<Int>().secondLargest() == null
assert listOf(1, 2, 3, 4).average2() == 2.5
assert listOf<Int>().average2() == 0.0
assert listOf(10).average2() == 10.0
```
