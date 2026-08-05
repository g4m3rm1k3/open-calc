---
series: kotlin-fundamentals
level: 0
title: Types, Variables & main()
lang: kotlin
---

# Types, Variables & main()

In 2010, engineers at JetBrains — the company behind IntelliJ IDEA, the IDE most Java developers already used every day — got tired of Java's ceremony. Null pointer exceptions kept crashing production systems. Simple data classes needed twenty lines of boilerplate for `equals`, `hashCode`, and `toString`. JetBrains needed a language for their own tooling that fixed this, while still running on the JVM and calling existing Java libraries without friction. They named it **Kotlin**, after an island near St. Petersburg, and released it publicly in 2011.

In 2017, Google made it official: Kotlin became a first-class language for Android development, alongside Java. Today it compiles to the same JVM bytecode Java does — a Kotlin program can call Java code, and Java code can call Kotlin, in the same project, in the same file's import list. This series assumes no Kotlin, teaching the language the same way `java-fundamentals` and `python-fundamentals` do: from the very first line, with the machine model underneath every construct.

## Your First Kotlin Program

```kotlin
fun main() {
    println("Hello, Kotlin!")
}
```

```text
Hello, Kotlin!
```

**Walkthrough:** `fun` declares a function — Kotlin's keyword for what Java spells `void` and a return type. `main()` is the entry point, exactly like Java's `main`, but with none of Java's required ceremony: no `public class Main`, no `public static void`, no `String[] args` unless you actually need command-line arguments. `println` — lowercase, no `System.out.` prefix — prints a line followed by a newline.

**SE lens:** Every one of those omissions is deliberate. JetBrains studied real Java codebases and found `public static void main(String[] args)` was typed thousands of times per project, always identically, communicating nothing project-specific. Kotlin's designers call this **boilerplate**: code required by the language's own rules rather than by anything the program actually needs to say. Removing it isn't a stylistic quirk — every year of avoided boilerplate is a small amount of Java's error surface (a forgotten `static`, a wrong parameter name) that simply cannot happen in Kotlin, because it was never written by hand.

## val and var — Kotlin's Two Kinds of Variable

```kotlin
fun main() {
    val name = "Kotlin"       // val = cannot be reassigned
    var count = 1              // var = can be reassigned

    count = count + 1
    println(name)
    println(count)
}
```

```text
Kotlin
2
```

**Walkthrough:** `val name = "Kotlin"` declares `name` with `val` — short for "value" — meaning `name` can never be pointed at a different string after this line. `var count = 1` declares `count` with `var` — short for "variable" — meaning it can be reassigned, which `count = count + 1` does. Java's closest equivalent to `val` is `final` (`final String name = "Kotlin";`), but Java makes immutability opt-in with an extra keyword; Kotlin makes it the shorter, more natural-looking choice, on the theory that most variables in a well-designed program should never change after they're set.

**CS lens:** This distinction is about **mutability** — whether the binding between a name and a value can change. `val` is not the same guarantee as an immutable *object*: `val list = mutableListOf(1, 2, 3)` means `list` can never point at a different list, but the list itself can still have items added to it. Level 6 (Collections) returns to this exact distinction with real consequences.

## Type Inference

```kotlin
fun main() {
    val name = "Kotlin"      // inferred: String
    val year = 2011           // inferred: Int
    val version = 2.2         // inferred: Double
    val isAwesome = true      // inferred: Boolean

    println("$name was released in $year, version $version, awesome=$isAwesome")
}
```

```text
Kotlin was released in 2011, version 2.2, awesome=true
```

**Walkthrough:** None of these four `val` declarations write a type anywhere — `String`, `Int`, `Double`, and `Boolean` are all determined by the compiler from the value on the right of `=`. This is **type inference**: Kotlin is still a statically typed language (every variable genuinely has one fixed type, checked at compile time, exactly like Java) — the compiler is just capable of figuring out what that type is from context, instead of requiring you to write it. You *can* write the type explicitly (`val year: Int = 2011`), and sometimes must (when there's no initial value to infer from), but for a value assigned immediately, it's redundant.

`"$name was released in $year..."` is a **string template**: `$name` inside a string literal is replaced with the value of the variable `name`, evaluated at that point. This replaces Java's `"..." + name + "..."` concatenation chains entirely — no `+` operators, no accidental type-coercion surprises from mixing strings and numbers.

## Kotlin's Basic Types

```kotlin
fun main() {
    val age: Int = 30
    val price: Double = 19.99
    val initial: Char = 'K'
    val isReady: Boolean = false
    val bigNumber: Long = 3_000_000_000L

    println("age=$age, price=$price, initial=$initial, isReady=$isReady, bigNumber=$bigNumber")
}
```

```text
age=30, price=19.99, initial=K, isReady=false, bigNumber=3000000000
```

**Walkthrough:** `Int`, `Double`, `Char`, `Boolean`, and `Long` are Kotlin's basic types — note the capital first letter, unlike Java's lowercase `int`, `double`, `char`, `boolean`, `long`. This isn't cosmetic: in Kotlin, `Int` really is a class with real methods you can call on it (`5.toString()` works directly), even though the compiler optimizes it down to the same raw JVM primitive `int` Java uses whenever possible — Kotlin removes the Java's split between primitives (`int`) and their boxed object wrapper classes (`Integer`) as something you ever have to think about yourself. `3_000_000_000L` shows two more things: the trailing `L` marks a numeric literal as `Long` (needed here since 3 billion overflows a 32-bit `Int`), and the underscores inside the number are a purely visual separator the compiler ignores — `3_000_000_000` and `3000000000` are the exact same value.

## Reading Input

```kotlin
fun main() {
    // readLine() reads one line from standard input, returning String? (nullable)
    print("What's your name? ")
    val name = readLine() ?: "stranger"
    println("Hello, $name!")
}
```

```text
What's your name? Hello, stranger!
```

**Walkthrough:** `readLine()` reads one line typed at standard input and returns it as a `String` — except this sandbox has no interactive input to give it, so it returns nothing (`null`), and `?: "stranger"` — Kotlin's **elvis operator**, covered fully in Level 3 — supplies `"stranger"` as the fallback used whenever the left side is `null`. The important, real detail even without live input available here: `readLine()`'s return type is `String?`, not `String` — the question mark means "this might genuinely be `null`," and Kotlin's compiler will not let you use it as a plain `String` without handling that possibility first. This is Kotlin's null-safety system announcing itself for the first time; Level 3 is the whole lesson built around it.

## Recognition

```text
Today: val/var, type inference, string templates

Also recognized in: Swift's let/var (the same split, same names, designed
around the same time), TypeScript's const/let, Rust's let/let mut, and C#'s
var alongside its own readonly — nearly every language designed after 2010
converged on "make immutable-by-default the short, easy spelling," which is
exactly the choice Kotlin's val/var makes explicit.
```

## Challenge: format_profile

Write `fun formatProfile(name: String, age: Int, isMember: Boolean): String` that returns a string built with a string template in exactly this shape: `"NAME is AGE years old and is a member: true/false"` — for example, `formatProfile("Alice", 30, true)` returns `"Alice is 30 years old and is a member: true"`.

```challenge
fun formatProfile(name: String, age: Int, isMember: Boolean): String {
    return ""
}
```

```test
assert formatProfile("Alice", 30, true) == "Alice is 30 years old and is a member: true"
assert formatProfile("Bob", 25, false) == "Bob is 25 years old and is a member: false"
assert formatProfile("Zoe", 41, true) == "Zoe is 41 years old and is a member: true"
assert formatProfile("Sam", 0, false) == "Sam is 0 years old and is a member: false"
```
