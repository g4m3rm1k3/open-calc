---
series: kotlin-fundamentals
level: 6
title: Collections
lang: kotlin
---

# Collections

Java's collections are mutable by default — an `ArrayList<String>` handed to any method can be silently emptied, appended to, or reordered by that method, and the caller has no way to know from the type alone whether that happened. Kotlin makes the read-only versus mutable distinction part of the type itself: `List<T>` genuinely cannot be modified through that reference, while `MutableList<T>` can. This lesson covers Kotlin's core collection types built around that split.

## List — Read-Only by Default

```kotlin
fun main() {
    val fruits = listOf("apple", "banana", "cherry")

    println(fruits)
    println(fruits[0])
    println(fruits.size)

    // fruits.add("date")  // COMPILE ERROR — List has no add() method at all
}
```

```text
[apple, banana, cherry]
apple
3
```

**Walkthrough:** `listOf("apple", "banana", "cherry")` creates a `List<String>` — Kotlin's read-only list type. `fruits[0]` reads the first element using index syntax (this is shorthand for `fruits.get(0)`, exactly like Java's `.get(0)`, just without writing `.get(...)`). The crucial detail is the commented-out line: `List<String>` simply has no `add` method in its type at all — this isn't a runtime check that throws an exception if you try to mutate it (like Java's `Collections.unmodifiableList`, which still compiles a call to `.add()` and only fails when you actually run it); it's a compile error, caught before the program ever runs.

**CS lens:** This is the exact same **type-system-enforced safety** idea from Level 3's nullable types, applied to mutability instead of nullability: rather than trusting every caller to remember "don't modify this," Kotlin makes the type itself refuse to compile the mistake.

## MutableList — When You Actually Need to Change It

```kotlin
fun main() {
    val fruits = mutableListOf("apple", "banana")

    fruits.add("cherry")
    fruits.removeAt(0)
    fruits[0] = "blueberry"

    println(fruits)
}
```

```text
[blueberry, cherry]
```

**Walkthrough:** `mutableListOf(...)` creates a `MutableList<String>` — the type that actually has `add`, `removeAt`, and index-assignment (`fruits[0] = "blueberry"`, sugar for `fruits.set(0, "blueberry")`). Note that `fruits` itself is still declared with `val` — the *variable* `fruits` can never be reassigned to point at a different list, but the *list object* it points to can still be mutated in place. This is the exact distinction Level 0 flagged as a preview: `val` guarantees the binding never changes, never that the object behind it is frozen.

**SE lens:** The idiomatic Kotlin default is `List`, reaching for `MutableList` only where mutation is genuinely needed and intentional — mirroring `java-architecture`'s repeated lesson that the safest state is state that cannot silently change out from under you. A function parameter typed `List<String>` is a promise, enforced by the compiler, that the function will not modify what you pass it — a promise Java can only make in a comment.

## Set — No Duplicates, Fast Membership Checks

```kotlin
fun main() {
    val uniqueNames = setOf("Alice", "Bob", "Alice", "Carol")
    println(uniqueNames)
    println(uniqueNames.size)
    println("Bob" in uniqueNames)
    println("Dave" in uniqueNames)
}
```

```text
[Alice, Bob, Carol]
3
true
false
```

**Walkthrough:** `setOf("Alice", "Bob", "Alice", "Carol")` builds a `Set<String>` — duplicate `"Alice"` collapses automatically, leaving three elements, not four. `"Bob" in uniqueNames` uses Kotlin's `in` operator to check membership — readable directly as English ("is Bob in uniqueNames"), and backed by the same hash-based `O(1)` average-case lookup `java-fundamentals`' Collections lesson covered for Java's own `HashSet`. There's also a `mutableSetOf(...)` for a `Set` that supports `add`/`remove`, following the same read-only-by-default split as `List`.

## Map — Key-Value Pairs

```kotlin
fun main() {
    val ages = mapOf("Alice" to 30, "Bob" to 25)

    println(ages)
    println(ages["Alice"])       // returns Int?, not Int — the key might not exist
    println(ages["Dave"])        // key not present -> null, not an exception

    val mutableAges = mutableMapOf("Alice" to 30)
    mutableAges["Bob"] = 25
    mutableAges["Alice"] = 31
    println(mutableAges)
}
```

```text
{Alice=30, Bob=25}
30
null
{Alice=31, Bob=25}
```

**Walkthrough:** `"Alice" to 30` builds a `Pair`, and `mapOf(...)` collects a series of pairs into a `Map<String, Int>` — read-only, same split as `List`. `ages["Alice"]` looks up a key and returns `Int?` — nullable, because Level 3 already established that "the key might genuinely not be present" has to be representable in the type, not just hoped never to happen; `ages["Dave"]` proves it, returning `null` rather than throwing (unlike Java's `HashMap.get`, which also returns `null` for a missing key, but without Kotlin's type system forcing every caller to actually handle that case before using the result). `mutableMapOf(...)` supports `mutableAges["Bob"] = 25` — index-assignment sugar for `.put("Bob", 25)` — and reassigning an existing key (`"Alice"` from `30` to `31`) simply overwrites it, same as Java's `HashMap`.

## Iterating Collections

```kotlin
fun main() {
    val scores = mapOf("Alice" to 90, "Bob" to 85)

    for (name in listOf("Alice", "Bob")) {
        println(name)
    }

    for ((name, score) in scores) {   // destructuring, from Level 5, applied to Map entries
        println("$name scored $score")
    }
}
```

```text
Alice
Bob
Alice scored 90
Bob scored 85
```

**Walkthrough:** Iterating a `List` with `for (name in list)` binds each element in turn, same as any range from Level 1. Iterating a `Map` with `for ((name, score) in scores)` uses Level 5's destructuring syntax directly against each key-value entry — `Map.Entry` is itself effectively a two-property data holder (`component1()` for the key, `component2()` for the value), so the same `(a, b)` unpacking syntax that worked on `Point` in Level 5 works here too, without Kotlin treating `Map` iteration as a special case requiring its own syntax.

## Recognition

```text
Today: List vs MutableList — read-only/mutable as distinct, compiler-checked types

Also recognized in: Rust's separate immutable and &mut references over the
same collection (a related but stricter compile-time guarantee), Java's
List.of() (added in Java 9, genuinely immutable — unlike the older,
runtime-checked Collections.unmodifiableList), and Swift's let vs var
applied directly to arrays and dictionaries, mirroring Kotlin's val/var
split at the collection level, not just the variable level.
```

## Challenge: word_frequency

Write `fun wordFrequency(words: List<String>): Map<String, Int>` that returns a map from each distinct word to how many times it appears in `words`. Build the result using a `mutableMapOf<String, Int>()` internally, then return it (its declared return type `Map<String, Int>` still hides the mutability from the caller, since `MutableMap` is a subtype of `Map`).

```challenge
fun wordFrequency(words: List<String>): Map<String, Int> {
    return mutableMapOf()
}
```

```test
val result = wordFrequency(listOf("cat", "dog", "cat", "bird", "dog", "cat"))
assert result["cat"] == 3
assert result["dog"] == 2
assert result["bird"] == 1
assert result.size == 3

val empty = wordFrequency(listOf())
assert empty.isEmpty()

val single = wordFrequency(listOf("only"))
assert single["only"] == 1
```
