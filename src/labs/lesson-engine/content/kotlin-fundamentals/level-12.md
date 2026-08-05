---
series: kotlin-fundamentals
level: 12
title: Object Declarations & Companion Objects
lang: kotlin
---

# Object Declarations & Companion Objects

Java has no dedicated syntax for the Singleton pattern — `java-architecture`'s Level 7 spent real effort constructing one by hand (a private constructor, a static instance field, careful initialization). Java also has no true equivalent of `static` members living *on* a specific class in a way that's a real, referenceable object. Kotlin has direct syntax for both, and this lesson covers them together, since they share the same underlying mechanism: the `object` keyword.

## object — A Class With Exactly One Instance

```kotlin
object AppConfig {
    val appName = "OpenCalc"
    var maxRetries = 3

    fun describe(): String = "$appName (max retries: $maxRetries)"
}

fun main() {
    println(AppConfig.describe())

    AppConfig.maxRetries = 5
    println(AppConfig.describe())

    // There is no "new AppConfig()" anywhere — it isn't a class you instantiate,
    // it's already the one and only instance, by construction.
}
```

```text
OpenCalc (max retries: 3)
OpenCalc (max retries: 5)
```

**Walkthrough:** `object AppConfig { ... }` declares a **singleton** directly — `AppConfig` is simultaneously the name of the type and the name of its one and only instance. `AppConfig.describe()` calls a method on it exactly like a static method call in Java, but `describe()` is a real instance method (it could use `this`, override an interface, and so on) — it just happens to belong to an object that Kotlin guarantees is created exactly once, lazily, the first time it's actually referenced.

**SE lens:** This is `java-architecture`'s hand-built Singleton pattern (Level 7 of that series, in spirit — a private constructor, a static field holding the one instance, a public accessor), reduced to one keyword. Every hazard that pattern has to guard against by hand in Java — a second constructor call slipping through, unsafe lazy initialization under concurrent access — is guaranteed correct by the Kotlin compiler and the JVM's own class-loading mechanism, with no code written to enforce it.

## companion object — Members That Belong to the Type, Not an Instance

```kotlin
class User private constructor(val name: String, val id: Int) {

    companion object {
        private var nextId = 1

        // A FACTORY FUNCTION (Level 7 of java-architecture, recognized again here) —
        // the ONLY way to build a User, since the constructor itself is private.
        fun create(name: String): User {
            val user = User(name, nextId)
            nextId++
            return user
        }
    }
}

fun main() {
    val alice = User.create("Alice")
    val bob = User.create("Bob")

    println("${alice.name} has id ${alice.id}")
    println("${bob.name} has id ${bob.id}")
}
```

```text
Alice has id 1
Bob has id 2
```

**Walkthrough:** `companion object { ... }` inside `class User` declares members that belong to `User` the *type* itself, not to any individual `User` instance — called as `User.create(...)`, not `someUser.create(...)`. `private constructor(val name: String, val id: Int)` makes `User`'s own primary constructor inaccessible from outside the class entirely — the only way to build a `User` anywhere in the program is through `User.create(name)`, which assigns a real, auto-incrementing `id` that a caller could never supply correctly by hand. This is the exact **Factory Method** pattern `java-architecture` Level 7 built with a separate `OrderFactory` class — Kotlin's `companion object` lets the factory logic live directly inside the type it constructs, rather than in an external class.

**CS lens:** A `companion object` is not merely syntax sugar for Java's `static` — it's a real, singleton object (usable, if needed, as a value implementing an interface, or passed around like any other object), that Kotlin happens to let you call through the enclosing class's name for convenience (`User.create(...)` instead of the more verbose `User.Companion.create(...)`, which also still works). Every class gets **at most one** companion object, and it must be declared with the exact word `companion` for that special calling convenience to apply.

## Named Companion Objects and Constants

```kotlin
class MathHelper {
    companion object Constants {
        const val PI_APPROX = 3.14159
        const val E_APPROX = 2.71828
    }
}

fun main() {
    println(MathHelper.PI_APPROX)
    println(MathHelper.Constants.PI_APPROX)   // the explicit name still works too
}
```

```text
3.14159
3.14159
```

**Walkthrough:** `const val PI_APPROX = 3.14159` inside a companion object declares a genuine **compile-time constant** — `const` (only legal for `val`, only for primitive types and `String`, and only directly inside an `object` or at file top level) tells the compiler to inline the literal value everywhere it's used, exactly like Java's `static final` constants. `MathHelper.PI_APPROX` accesses it through the enclosing class's name directly; naming the companion object `Constants` explicitly (instead of leaving it anonymous) additionally allows the more verbose `MathHelper.Constants.PI_APPROX` form — rarely needed, but occasionally useful when a companion object itself needs to implement an interface under a specific, referenceable name.

## Recognition

```text
Today: object (singleton) and companion object (type-level members, factories)

Also recognized in: Scala's object keyword (Kotlin's most direct ancestor
for this exact syntax), Java's own static fields/methods and the
hand-written Singleton pattern from Level 7 of java-architecture (what
companion object and object both replace), and Swift's static members
combined with its own private init pattern for the same
factory-method-only-construction idea shown above.
```

## Challenge: connection_pool

Write `object ConnectionPool` with:
- a private `var activeConnections = 0`
- `fun acquire(): Int` — increments `activeConnections` and returns the new value; throws `IllegalStateException` if `activeConnections` is already `5` (the pool's max size)
- `fun release()` — decrements `activeConnections`, but never below `0`
- `fun current(): Int` — returns the current `activeConnections` count

```challenge
object ConnectionPool {
    private var activeConnections = 0

    fun acquire(): Int {
        return 0
    }

    fun release() {
    }

    fun current(): Int {
        return activeConnections
    }
}
```

```test
assert ConnectionPool.current() == 0

ConnectionPool.acquire()
ConnectionPool.acquire()
assert ConnectionPool.current() == 2

ConnectionPool.release()
assert ConnectionPool.current() == 1

repeat(4) { ConnectionPool.acquire() }
var threwOnOverflow = false
try {
    ConnectionPool.acquire()
} catch (e: IllegalStateException) {
    threwOnOverflow = true
}
assert threwOnOverflow
assert ConnectionPool.current() == 5
```
