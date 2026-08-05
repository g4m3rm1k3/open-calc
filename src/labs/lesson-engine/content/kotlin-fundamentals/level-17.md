---
series: kotlin-fundamentals
level: 17
title: Scope Functions
lang: kotlin
---

# Scope Functions

Level 3 introduced `let` as a way to run code only when a nullable value isn't `null`. That was actually one specific use of a broader Kotlin idea: **scope functions** — `let`, `run`, `with`, `apply`, and `also` — five standard-library functions that all do roughly the same mechanical thing (run a block of code "in the context of" some object) but differ in two small, memorizable ways: how the object is referred to inside the block (`it` vs `this`), and what the whole expression returns.

## let — Access via it, Returns the Lambda's Result

```kotlin
data class User(val name: String, val email: String)

fun main() {
    val user = User("Alice", "alice@example.com")

    // let: the object is "it"; the whole expression's value is whatever the block returns.
    val greeting = user.let {
        "Hello, ${it.name}! Contact: ${it.email}"
    }
    println(greeting)
}
```

```text
Hello, Alice! Contact: alice@example.com
```

**Walkthrough:** `user.let { ... }` runs the block with `user` available as `it`, and the entire `user.let { }` expression evaluates to whatever the block's last line produces — here, the greeting string, assigned directly to `greeting`. This is the same `let` from Level 3's `email?.let { sendWelcomeEmail(it) }`, generalized: `let` is genuinely useful on any value, not only nullable ones — it's just especially common combined with `?.` because "run this block, but only if non-null, and give me back what the block computed" is such a frequent need.

## apply — Access via this, Returns the Object Itself

```kotlin
class Person {
    var name: String = ""
    var age: Int = 0
}

fun main() {
    // apply: the object is "this" (often omitted); the whole expression returns the OBJECT itself.
    val person = Person().apply {
        name = "Bob"
        age = 30
    }
    println("${person.name}, ${person.age}")
}
```

```text
Bob, 30
```

**Walkthrough:** `Person().apply { name = "Bob"; age = 30 }` runs the block with the newly created `Person` available as `this` — meaning `name = "Bob"` inside the block is really `this.name = "Bob"`, no `it.` prefix needed at all, since `this` can be omitted the way it always can be inside a class's own methods. Critically, `apply` returns the *object itself* (not whatever the block's last line evaluates to) — `person` ends up bound to the actual `Person` instance, configured. This is Kotlin's idiomatic replacement for the object-configuration step of `java-architecture`'s Builder pattern (Level 7 of that series): instead of a separate `Builder` class with chained setter methods, `apply` configures an ordinary object's own real properties directly, in one expression.

## also — Access via it, Returns the Object Itself

```kotlin
fun main() {
    val numbers = mutableListOf(1, 2, 3)
        .also { println("Created list with ${it.size} elements") }

    numbers.add(4)
    println(numbers)
}
```

```text
Created list with 3 elements
[1, 2, 3, 4]
```

**Walkthrough:** `also` uses `it` (like `let`) but returns the original object itself (like `apply`) — the combination that's useful for a side effect (logging, printing, a sanity check) that shouldn't interrupt a chain of calls. `mutableListOf(1, 2, 3).also { println(...) }` prints a message about the list, then the whole expression still evaluates to the list itself, so `numbers` ends up as that same list, ready to keep using (`.add(4)` right after).

## run and with — Access via this, Returns the Block's Result

```kotlin
class Rectangle(val width: Double, val height: Double)

fun main() {
    val rect = Rectangle(4.0, 5.0)

    // run: called ON an object, "this", returns the block's result.
    val area = rect.run {
        width * height
    }
    println(area)

    // with: takes the object as a PARAMETER (not a method call), otherwise identical to run.
    val perimeter = with(rect) {
        2 * (width + height)
    }
    println(perimeter)
}
```

```text
20.0
18.0
```

**Walkthrough:** `rect.run { width * height }` runs with `rect` as `this` (so `width` and `height` resolve directly, no prefix needed), and returns the block's result — the computed area — combining `let`'s "returns the block's result" with `apply`'s "`this`, not `it`." `with(rect) { ... }` is functionally identical to `run`, but written as a standalone function taking the object as an argument rather than being called as a method on it — purely a stylistic choice for when you already have the object in hand and don't need method-chaining syntax.

## The Complete Picture

```text
        | Access via | Returns
--------|------------|------------------
let     | it         | the block's result
run     | this       | the block's result
with    | this       | the block's result (called as with(obj) { }, not obj.with { })
apply   | this       | the object itself
also    | it         | the object itself
```

**SE lens:** Memorizing this table isn't really the point — the actual skill is recognizing the two questions each choice answers: "do I need `it` (an explicit name, useful when passing the value along, or when the block's own members would otherwise shadow the outer object's) or `this` (implicit, more natural for configuring the object's own properties)?" and "do I want the block's *result* (transforming or computing something new) or the *original object back* (a side effect, or a fluent configuration chain)?" Every real use of a scope function is really just answering those two questions.

## Recognition

```text
Today: let, run, with, apply, also — five variations on "run code in an
object's context"

Also recognized in: JavaScript/TypeScript's optional chaining plus a
manual IIFE achieving something similar to let, Ruby's tap (functionally
identical to also — "do something with this value, then hand it back
unchanged"), and Groovy's with block, one of Kotlin's direct inspirations
for this whole family of functions.
```

## Challenge: scope_function_practice

Write `fun buildGreeting(name: String): String` returning `"Hello, NAME!"`, computed using `name.let { ... }` so the block's result becomes the function's return value. Then write `data class Config(var host: String = "", var port: Int = 0)` and `fun defaultConfig(): Config` using `apply` to set `host = "localhost"` and `port = 8080` on a new `Config()`, returning the configured object.

```challenge
data class Config(var host: String = "", var port: Int = 0)

fun buildGreeting(name: String): String {
    return name
}

fun defaultConfig(): Config {
    return Config()
}
```

```test
assert buildGreeting("Alice") == "Hello, Alice!"
assert buildGreeting("Bob") == "Hello, Bob!"

val config = defaultConfig()
assert config.host == "localhost"
assert config.port == 8080
assert config is Config
```
