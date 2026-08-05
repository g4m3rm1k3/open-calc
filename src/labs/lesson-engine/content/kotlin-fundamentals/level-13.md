---
series: kotlin-fundamentals
level: 13
title: Sealed Classes
lang: kotlin
---

# Sealed Classes

`java-architecture` Level 5 built a real finite state machine for an order's lifecycle — `PlacedState`, `PaidState`, `ShippedState`, `CancelledState` — each implementing a shared `OrderState` interface, in Java. That design had one gap Java's type system couldn't close: nothing stopped a fifth, unrelated class from implementing `OrderState` somewhere else in the codebase, and nothing let a `when` (or Java's `switch`) over `OrderState` be checked as complete. Kotlin's **sealed class** closes exactly that gap.

## The Problem: An Open-Ended Hierarchy

```kotlin
interface Shape {
    fun area(): Double
}

class Circle(val radius: Double) : Shape {
    override fun area() = Math.PI * radius * radius
}

class Square(val side: Double) : Shape {
    override fun area() = side * side
}

fun describe(shape: Shape): String = when (shape) {
    is Circle -> "Circle with area ${shape.area()}"
    is Square -> "Square with area ${shape.area()}"
    else -> "Unknown shape"   // REQUIRED — the compiler can't prove Circle/Square are the only options
}

fun main() {
    println(describe(Circle(2.0)))
    println(describe(Square(3.0)))
}
```

```text
Circle with area 12.566370614359172
Square with area 9.0
```

**Walkthrough:** `when (shape) { is Circle -> ...; is Square -> ...; else -> ... }` branches on `shape`'s actual runtime type using `is` — the same **type-checking pattern matching** style `java-fundamentals` Level 15 covered for Java's own `instanceof` pattern matching. The `else` branch here is not optional — `interface Shape` places no limit on how many classes might implement it, anywhere in the codebase, including code written after this file, so the compiler cannot prove these two branches are exhaustive. That `else` branch is dead code today, but it's a real liability: if someone adds `class Triangle : Shape` next month, this `when` compiles unchanged and silently routes every triangle into `"Unknown shape"` — a real bug the compiler had every opportunity to catch and didn't.

## sealed class — A Hierarchy the Compiler Can See Completely

```kotlin
sealed class Shape

class Circle(val radius: Double) : Shape() {
    fun area() = Math.PI * radius * radius
}

class Square(val side: Double) : Shape() {
    fun area() = side * side
}

// NO else branch — and this still compiles, because sealed guarantees
// Circle and Square are the ONLY possible subtypes, forever, in this file.
fun describe(shape: Shape): String = when (shape) {
    is Circle -> "Circle with area ${shape.area()}"
    is Square -> "Square with area ${shape.area()}"
}

fun main() {
    println(describe(Circle(2.0)))
    println(describe(Square(3.0)))
}
```

```text
Circle with area 12.566370614359172
Square with area 9.0
```

**Walkthrough:** `sealed class Shape` declares that every direct subclass of `Shape` must be defined in the same file (as of modern Kotlin, the same compilation module) — no class anywhere else in the entire codebase can ever add a third subtype. Because of that closed, fully-known set, the `when` in `describe` needs no `else` branch at all: the compiler checks, at compile time, that `is Circle` and `is Square` together cover every possible `Shape`, and would refuse to compile if a third subtype existed without its own branch.

**CS lens:** This is exhaustiveness checking (first introduced in Level 9) at its strongest possible form. The interface version's `else` branch was a promise a human made and the compiler had to trust. The sealed-class version's missing `else` branch is a guarantee the *compiler* makes and enforces — add `class Triangle : Shape()` to this file, and every `when` over `Shape` anywhere in the codebase that lacks a `Triangle` branch stops compiling immediately, at the exact moment the gap is introduced, not sometime later when a triangle actually reaches that code at runtime.

## Sealed Classes for Real State Machines

```kotlin
sealed class OrderState {
    object Placed : OrderState()
    object Paid : OrderState()
    object Shipped : OrderState()
    data class Cancelled(val reason: String) : OrderState()
}

fun describeState(state: OrderState): String = when (state) {
    is OrderState.Placed -> "Order placed, awaiting payment"
    is OrderState.Paid -> "Payment received, preparing to ship"
    is OrderState.Shipped -> "On its way!"
    is OrderState.Cancelled -> "Cancelled: ${state.reason}"
}

fun main() {
    println(describeState(OrderState.Placed))
    println(describeState(OrderState.Shipped))
    println(describeState(OrderState.Cancelled("Out of stock")))
}
```

```text
Order placed, awaiting payment
On its way!
Cancelled: Out of stock
```

**Walkthrough:** This is `java-architecture` Level 5's `OrderState` hierarchy, rebuilt in Kotlin: `object Placed`, `object Paid`, and `object Shipped` are singletons (Level 12) — states with no data of their own beyond which one they are — while `data class Cancelled(val reason: String)` carries extra information a plain object can't. The `when` in `describeState` can access `state.reason` directly inside the `is OrderState.Cancelled ->` branch, because Kotlin **smart-casts** `state` to the specific subtype that branch matched — inside that one branch, `state` genuinely has type `OrderState.Cancelled`, not the general `OrderState`, so its `reason` property is visible without any manual cast.

**SE lens:** This is a strictly stronger version of the exact pattern `java-architecture` built by hand with a plain `interface OrderState` and four separate top-level classes. That design was correct, but nothing in Java's type system stopped a fifth class from silently implementing `OrderState` elsewhere, or caught a `switch` that forgot to handle one of the four real states. `sealed class` closes both gaps at compile time, for free.

## Recognition

```text
Today: sealed class — a closed, compiler-verified hierarchy

Also recognized in: Rust's enum with data-carrying variants (arguably
sealed classes' closest relative — Rust's match is exhaustive over
exactly this shape), Swift's enum with associated values, Scala's sealed
trait (Kotlin's direct ancestor for this feature), and TypeScript's
discriminated unions, which recreate the same guarantee through a shared
"kind" field checked exhaustively, without true language-level sealing.
```

## Challenge: payment_result

Write `sealed class PaymentResult` with three subtypes: `object Success` (no data), `data class Declined(val reason: String)`, and `data class NetworkError(val errorCode: Int)`. Then write `fun describeResult(result: PaymentResult): String` using a `when` with no `else` branch, returning: `"Payment succeeded"` for `Success`, `"Payment declined: REASON"` for `Declined`, and `"Network error (code CODE)"` for `NetworkError`.

```challenge
sealed class PaymentResult

fun describeResult(result: PaymentResult): String {
    return ""
}
```

```test
assert describeResult(PaymentResult.Success) == "Payment succeeded"
assert describeResult(PaymentResult.Declined("Insufficient funds")) == "Payment declined: Insufficient funds"
assert describeResult(PaymentResult.NetworkError(503)) == "Network error (code 503)"
assert PaymentResult.Success is PaymentResult
assert PaymentResult.Declined("x") is PaymentResult
```
