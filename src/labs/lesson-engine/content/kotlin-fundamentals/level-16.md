---
series: kotlin-fundamentals
level: 16
title: Exceptions
lang: kotlin
---

# Exceptions

Java's exceptions come in two flavors: **checked** (must be declared with `throws` or caught, enforced at compile time — `IOException`, most famously) and **unchecked** (`RuntimeException` and its subtypes, no compiler enforcement at all). Kotlin has exactly one flavor: every exception in Kotlin behaves like Java's unchecked exceptions. This lesson covers why, and how `try` becomes another expression, following the same pattern `if` and `when` already established.

## try/catch — Familiar Structure

```kotlin
fun divide(a: Int, b: Int): Int {
    return a / b
}

fun main() {
    try {
        val result = divide(10, 0)
        println(result)
    } catch (e: ArithmeticException) {
        println("Caught: ${e.message}")
    }
}
```

```text
Caught: / by zero
```

**Walkthrough:** This reads almost identically to Java: `try { ... } catch (e: ArithmeticException) { ... }` runs the `try` block, and if an `ArithmeticException` is thrown anywhere inside it, control jumps to the matching `catch` block, binding the thrown exception to `e`. `e.message` reads the exception's descriptive text, exactly like Java's `e.getMessage()` — but as a property, not a method call, following Level 4's pattern of exposing data through properties rather than explicit getter methods.

## No Checked Exceptions

```kotlin
import java.io.File

// No "throws IOException" required anywhere — Kotlin doesn't have that concept.
fun readFirstLine(path: String): String {
    return File(path).readLines().first()
}

fun main() {
    try {
        val line = readFirstLine("/does/not/exist.txt")
        println(line)
    } catch (e: Exception) {
        println("Caught: ${e.javaClass.simpleName}")
    }
}
```

```text
Caught: FileNotFoundException
```

**Walkthrough:** `readFirstLine` calls `File(path).readLines()`, which — on the JVM, underneath — can throw `IOException`, a **checked** exception in Java's own rules. In Java, a method calling this would be *required* to either catch `IOException` or declare `throws IOException` in its own signature, or the code simply wouldn't compile. Kotlin has no such requirement: `readFirstLine`'s signature declares nothing about what it might throw, and it still compiles and runs correctly — the exception, when it happens, propagates up exactly like any other exception, and is caught here with a plain `catch (e: Exception)`.

**SE lens:** JetBrains's own stated reasoning: checked exceptions, in practice, led to two common anti-patterns in real Java code — catching an exception and doing nothing with it (`catch (IOException e) {}`, silently swallowing a real error just to satisfy the compiler), or declaring `throws Exception` on every method up the call chain, which defeats the entire purpose of checking anything specific. Kotlin's designers concluded the compile-time enforcement wasn't actually preventing bugs in practice, just adding ceremony — so they removed it, while keeping exceptions themselves, unchanged, as the mechanism for signaling real failure.

## try as an Expression

```kotlin
fun parseIntOrDefault(text: String, default: Int): Int {
    return try {
        text.toInt()
    } catch (e: NumberFormatException) {
        default
    }
}

fun main() {
    println(parseIntOrDefault("42", 0))
    println(parseIntOrDefault("not a number", -1))
}
```

```text
42
-1
```

**Walkthrough:** Exactly like `if` (Level 1) and `when` (Level 9), `try` can be used as an expression whose value is whatever the last-evaluated line inside the successful branch (or the matching `catch`) produces. `try { text.toInt() } catch (e: NumberFormatException) { default }` evaluates to `text.toInt()`'s result if no exception is thrown, or to `default` if a `NumberFormatException` is caught — `return`ed directly, with no intermediate `var` needed to hold the result across the `try`/`catch`.

## Custom Exceptions

```kotlin
class InsufficientFundsException(message: String) : Exception(message)

class BankAccount(private var balance: Double) {
    fun withdraw(amount: Double) {
        if (amount > balance) {
            throw InsufficientFundsException("Cannot withdraw $amount from balance of $balance")
        }
        balance -= amount
    }
}

fun main() {
    val account = BankAccount(100.0)
    try {
        account.withdraw(150.0)
    } catch (e: InsufficientFundsException) {
        println("Rejected: ${e.message}")
    }
}
```

```text
Rejected: Cannot withdraw 150.0 from balance of 100.0
```

**Walkthrough:** `class InsufficientFundsException(message: String) : Exception(message)` defines a custom exception type in one line — extending `Exception` (Kotlin, like Java, has a real exception class hierarchy: `Throwable` at the root, `Exception` beneath it, `RuntimeException` beneath that) and passing `message` straight through to `Exception`'s own constructor. `throw InsufficientFundsException(...)` raises it exactly like any built-in exception; `catch (e: InsufficientFundsException)` catches specifically that type, distinguishing it from any other kind of failure that might occur in the same `try` block.

**SE lens:** A custom, specifically-named exception type — instead of throwing a generic `Exception("insufficient funds")` — lets calling code catch precisely the failure it knows how to handle (`InsufficientFundsException`) while letting every other, genuinely unexpected exception propagate unhandled, exactly the same design discipline `java-architecture`'s guard-clause and custom-exception lessons taught in Java.

## Recognition

```text
Today: unchecked-only exceptions, try as an expression, custom exception types

Also recognized in: C#'s exceptions (also entirely unchecked, for nearly
identical reasons Kotlin cites), Python's exceptions (also unchecked,
predating both languages), and Java's own checked-exceptions debate,
still ongoing decades after Java's release — Kotlin's design is a direct,
explicit answer to one side of that long-running argument.
```

## Challenge: safe_divider

Write `class DivisionByZeroException(message: String) : Exception(message)`. Then write `fun safeDivide(a: Int, b: Int): Int` that throws `DivisionByZeroException("Cannot divide $a by zero")` if `b` is `0`, otherwise returns `a / b`. Then write `fun safeDivideOrDefault(a: Int, b: Int, default: Int): Int` using `try` as an expression that returns `safeDivide(a, b)`, or `default` if a `DivisionByZeroException` is caught.

```challenge
class DivisionByZeroException(message: String) : Exception(message)

fun safeDivide(a: Int, b: Int): Int {
    return 0
}

fun safeDivideOrDefault(a: Int, b: Int, default: Int): Int {
    return default
}
```

```test
assert safeDivide(10, 2) == 5
assert safeDivideOrDefault(10, 2, -1) == 5
assert safeDivideOrDefault(10, 0, -1) == -1

var threw = false
var caughtMessage = ""
try {
    safeDivide(5, 0)
} catch (e: DivisionByZeroException) {
    threw = true
    caughtMessage = e.message ?: ""
}
assert threw
assert caughtMessage == "Cannot divide 5 by zero"
```
