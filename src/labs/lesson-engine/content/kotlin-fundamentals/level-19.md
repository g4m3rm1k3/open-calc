---
series: kotlin-fundamentals
level: 19
title: Suspend Functions & Coroutines
lang: kotlin
---

# Suspend Functions & Coroutines

`java-fundamentals` Level 23 covered Java's `Thread` — real, heavyweight operating-system threads, expensive enough that a server handling thousands of concurrent requests can't just spawn one thread per request without exhausting memory. Kotlin's answer is **coroutines**: lightweight units of suspendable work that don't block a real thread while waiting, letting a single thread juggle thousands of them. This lesson covers the one piece of coroutines that's part of the Kotlin language itself — the `suspend` keyword — and is honest about the one piece that isn't: real concurrent coroutines need an external library this sandbox doesn't have loaded.

## suspend — A Function That Can Pause

```kotlin
suspend fun fetchUserName(userId: Int): String {
    // A suspend function CAN pause here to wait on something slow (a network
    // call, a database query) without blocking the real underlying thread —
    // this example has nothing slow to actually wait on, but the KEYWORD
    // is what matters: it marks this function as one that's allowed to.
    return "User#$userId"
}

suspend fun main() {
    val name = fetchUserName(42)
    println("Fetched: $name")
}
```

```text
Fetched: User#42
```

**Walkthrough:** `suspend fun fetchUserName(userId: Int): String` marks this function with the `suspend` modifier — a real part of Kotlin's own language grammar (not a library feature), meaning this function is allowed to pause its execution at certain points and resume later, without blocking whatever real thread called it. `suspend fun main()` is a genuine, directly-supported entry point since Kotlin 1.3 — the compiler wraps it appropriately so a suspend function can be the very first thing that runs. Calling `fetchUserName(42)` from inside `main` is legal specifically *because* `main` is itself `suspend` — a suspend function can only be called from another suspend function (or from a **coroutine builder**, covered next), never from an ordinary one.

**CS lens:** This calling restriction — suspend calls suspend — is enforced by the compiler at every call site, the same way Level 3's nullable types are enforced: you cannot accidentally call a suspend function from context that isn't prepared to handle a pause, because it simply won't compile. This is what makes Kotlin's concurrency **structured**: the compiler itself tracks which parts of your program are "suspend-aware," rather than trusting the programmer to remember.

## What suspend Actually Unlocks — Honestly

```text
suspend fun downloadFile(url: String): ByteArray {
    // A real suspend function performing real async I/O would look
    // roughly like this, using kotlinx.coroutines — Kotlin's official
    // coroutines LIBRARY (not the language itself):

    return withContext(Dispatchers.IO) {
        // ... actual network code here ...
        ByteArray(0)
    }
}

fun main() = runBlocking {
    launch {
        val file = downloadFile("https://example.com/data")
        println("Downloaded ${file.size} bytes")
    }
    launch {
        println("This runs CONCURRENTLY with the download above")
    }
}
```

The `suspend` keyword above is real, plain Kotlin. `runBlocking`, `launch`, `withContext`, and `Dispatchers` are **not** — they come from `kotlinx.coroutines`, Kotlin's official coroutines library, which every real Kotlin project adds as a dependency, but which is a separate library, not the language core, and is not available in this lesson's sandboxed runner. This code is shown as reference only — it will not run here.

**SE lens:** This is the honest version of a claim worth making carefully: `suspend` is genuinely part of the Kotlin language, and everything in Levels 0–18 of this series is real, runnable Kotlin you've now actually executed and tested. Concurrency itself — actually running multiple coroutines *at the same time*, coordinated by a scheduler (`Dispatchers.IO` for I/O-bound work, `Dispatchers.Default` for CPU-bound work) — is a library's job, layered on top of the language's `suspend` support. Knowing exactly where that line sits is itself useful, professional knowledge: it's the same distinction as knowing that Java's `synchronized` keyword is language-level while `java.util.concurrent`'s `ExecutorService` is a library built using lower-level tools the language provides.

## Sequential Composition — What Actually Runs Here

```kotlin
suspend fun validateOrder(orderId: Int): Boolean {
    println("Validating order $orderId")
    return orderId > 0
}

suspend fun chargePayment(orderId: Int): Boolean {
    println("Charging payment for order $orderId")
    return true
}

suspend fun processOrder(orderId: Int): String {
    if (!validateOrder(orderId)) return "Invalid order"
    if (!chargePayment(orderId)) return "Payment failed"
    return "Order $orderId processed successfully"
}

suspend fun main() {
    println(processOrder(101))
    println(processOrder(-1))
}
```

```text
Validating order 101
Charging payment for order 101
Order 101 processed successfully
Validating order -1
Invalid order
```

**Walkthrough:** Every function here is `suspend`, so every call is legal — `processOrder` calls `validateOrder` and `chargePayment`, each in turn, each one completing before the next begins. Nothing here is actually concurrent — this runs top to bottom, sequentially, exactly like ordinary function calls would. That's a genuine, honest description of what plain `suspend` functions do *without* a coroutine builder like `launch` actually starting them on separate, concurrently-scheduled coroutines: `suspend` marks functions as *capable* of pausing without blocking a thread; it doesn't, by itself, make separate calls run at the same time as each other.

## Recognition

```text
Today: suspend — the language-level marker for pausable functions

Also recognized in: JavaScript's async/await (suspend fun is Kotlin's
closest direct analogue — both mark a function as pausable, both require
the caller to itself be async/suspend, both build on a lower-level
mechanism — Promises for JS, kotlinx.coroutines for Kotlin), Python's
async def, and C#'s async/await (Task-based, one of the earliest
mainstream implementations of this exact pattern, predating both).
```

## Challenge: retry_schedule

Concurrency libraries like `kotlinx.coroutines` are commonly used to implement retry-with-backoff logic — retrying a failed operation with an increasing delay between attempts. Write `fun retryDelays(maxAttempts: Int, baseDelayMs: Long): List<Long>` (an ordinary, non-suspend function — pure computation, no actual waiting) that returns the delay before each retry attempt using **exponential backoff**: attempt 1's delay is `baseDelayMs`, attempt 2's is `baseDelayMs * 2`, attempt 3's is `baseDelayMs * 4`, and so on (each delay double the previous one), for `maxAttempts` total values.

```challenge
fun retryDelays(maxAttempts: Int, baseDelayMs: Long): List<Long> {
    return emptyList()
}
```

```test
assert retryDelays(3, 100) == listOf(100L, 200L, 400L)
assert retryDelays(1, 500) == listOf(500L)
assert retryDelays(4, 10) == listOf(10L, 20L, 40L, 80L)
assert retryDelays(0, 100) == emptyList<Long>()
```
