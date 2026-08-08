---
series: kotlin-fundamentals
level: 3
title: Nullable Types & Null Safety
lang: kotlin
---

# Nullable Types & Null Safety

In 2009, Tony Hoare — the computer scientist who invented the `null` reference in 1965 — publicly called it his "billion-dollar mistake," estimating the cost of null-pointer bugs across the software industry at that scale. Java inherited `null` unchanged: any variable of an object type can silently be `null`, and the compiler will not stop you from calling a method on it, crashing at runtime with a `NullPointerException` — usually far from wherever the `null` actually originated. Kotlin's answer, baked into its type system from day one, is the subject of this lesson: the compiler itself refuses to compile code that might dereference a `null` without first proving it isn't one.

## The Problem Kotlin Is Solving

```kotlin
fun main() {
    // In Java, this compiles fine and crashes at runtime if getUser() ever returns null:
    //   String email = getUser().getEmail();  // NullPointerException, maybe, sometimes
    //
    // Kotlin makes "might be null" part of the TYPE ITSELF:
    val name: String = "Alice"      // String — can NEVER hold null
    val nickname: String? = null    // String? — CAN hold null

    println(name)
    println(nickname)
}
```

```text
Alice
null
```

**Walkthrough:** `String` and `String?` are two genuinely different types in Kotlin, not the same type with an informal convention layered on top. `val name: String = "Alice"` — no question mark — means the compiler guarantees `name` can never be `null`, for the entire lifetime of the program; there is no way to assign `null` to it that would even compile. `val nickname: String? = null` — with the question mark — means `nickname` is explicitly allowed to be `null`, and every future use of `nickname` must account for that possibility, or the code won't compile.

**CS lens:** This is **null safety implemented through the type system**, not through runtime checks the programmer has to remember to write. Java has one type, `String`, that silently permits both "a real string" and "nothing at all," and finding out which one you actually have requires either checking or crashing. Kotlin splits that into two distinguishable types, so the compiler — not a runtime exception, not a code reviewer, not you six months later — enforces the check at every point a nullable value is used.

## Safe Calls with ?.

```kotlin
fun main() {
    val name: String? = "Alice"
    val nothing: String? = null

    // .length directly would fail to compile: name is String?, might be null.
    println(name?.length)      // safe call: runs .length if non-null, else...
    println(nothing?.length)   // ...produces null instead of crashing
}
```

```text
5
null
```

**Walkthrough:** `name?.length` is a **safe call**: if `name` is not `null`, it evaluates to `name.length` normally; if `name` is `null`, the whole expression short-circuits to `null` immediately — `.length` is never actually called on anything, so there is no crash to have. `nothing?.length` demonstrates the `null` case directly: the result is `null`, printed as the literal text `null`, not an exception. The plain `.` (no question mark) is not a fallback dot notation — for a `String?`-typed variable, writing `nothing.length` without the `?` is a **compile error**, not a runtime risk. This is the core of the whole feature: the unsafe operation doesn't compile in the first place.

## The Elvis Operator ?:

```kotlin
fun main() {
    val nickname: String? = null

    // ?: supplies a fallback value when the left side is null.
    val displayName = nickname ?: "Anonymous"
    println(displayName)

    val realNickname: String? = "Ace"
    val displayName2 = realNickname ?: "Anonymous"
    println(displayName2)
}
```

```text
Anonymous
Ace
```

**Walkthrough:** `nickname ?: "Anonymous"` — the **elvis operator** (named for how `?:` looks rotated ninety degrees, like a smiley with a hair curl) — evaluates to `nickname` itself if it's non-null, or to `"Anonymous"` if `nickname` is `null`. This is Kotlin's direct replacement for the Java pattern `nickname != null ? nickname : "Anonymous"`, or the even more common Java bug pattern of forgetting that check entirely. `?:` can appear anywhere an expression can — assigned to a `val`, passed as a function argument, returned directly from a function.

## The Non-Null Assertion !! — and Why to Avoid It

```kotlin
fun main() {
    val nickname: String? = "Ace"

    // !! asserts "I personally guarantee this isn't null" — and THROWS if you're wrong.
    val length = nickname!!.length
    println(length)

    val nothing: String? = null
    try {
        val crash = nothing!!.length   // this genuinely throws — !! is not a safe operation
        println(crash)
    } catch (e: Exception) {
        println("Crashed: " + e.javaClass.simpleName)
    }
}
```

```text
3
Crashed: NullPointerException
```

**Walkthrough:** `nickname!!.length` — the **non-null assertion operator** — tells the compiler "trust me, this is never `null` here," converting `String?` to a plain `String` on the spot. If you're right, it behaves exactly like `.length` on a non-nullable value. If you're wrong — as the `nothing!!.length` case shows — it throws a real `NullPointerException` at that exact line, which is precisely the crash Kotlin's whole null-safety system exists to prevent.

**SE lens:** `!!` is not a loophole that makes Kotlin's null safety optional — it's an escape hatch that exists for genuinely rare cases (interfacing with old Java code whose own nullability isn't documented in its types, mostly) and, when used casually, reintroduces exactly the bug class the rest of this lesson eliminates. Idiomatic Kotlin treats a `!!` anywhere in a code review as a question: "why can't this be a proper `?.` or `?:` instead?" Reaching for `!!` out of impatience, rather than genuine certainty backed by the code around it, is considered a real code smell, not a shortcut.

## let — Running Code Only When Non-Null

```kotlin
fun sendWelcomeEmail(email: String) {
    println("Sending welcome email to $email")
}

fun main() {
    val email: String? = "alice@example.com"

    // ?.let { } runs the block ONLY if the value is non-null,
    // and the value is available inside the block already smart-cast to non-null.
    email?.let {
        sendWelcomeEmail(it)
    }

    val missingEmail: String? = null
    missingEmail?.let {
        sendWelcomeEmail(it)   // never runs — missingEmail is null
    }
    println("Done")
}
```

```text
Sending welcome email to alice@example.com
Done
```

**Walkthrough:** `email?.let { sendWelcomeEmail(it) }` combines a safe call with `let` — a function that runs its `{ }` block with the value passed in as `it`, only if `email` isn't `null`. Inside that block, `it` has type `String` (not `String?`) — the compiler has already proven, by the time you're inside the block, that null was ruled out, so no further `?.` or `!!` is needed there. `missingEmail?.let { ... }` never runs its block at all, since `missingEmail` is `null` — no email is sent, and no crash occurs either. Level 17 returns to `let` alongside four related **scope functions** in full.

## Recognition

```text
Today: nullable types (T?), safe calls (?.), elvis (?:), and !!

Also recognized in: Swift's Optional<T> (near-identical ?, ??, and !
operators, designed independently around the same time), TypeScript's
strictNullChecks mode (string | null as a real, checked union type),
Rust's Option<T> (no null at all — absence is a real enum variant, checked
exhaustively), and C#'s nullable reference types (added in C# 8, years
after Kotlin, explicitly citing Kotlin and Swift as prior art).
```

## Challenge: safe_greeting

Write `fun safeGreeting(name: String?): String` returning `"Hello, NAME!"` when `name` is non-null, or `"Hello, stranger!"` when `name` is `null` — using the elvis operator (`?:`), not an `if`/`else` statement.

```challenge
fun safeGreeting(name: String?): String {
    return ""
}
```

```test
assert safeGreeting("Alice") == "Hello, Alice!"
assert safeGreeting(null) == "Hello, stranger!"
assert safeGreeting("Bob") == "Hello, Bob!"
assert safeGreeting("") == "Hello, !"
```
