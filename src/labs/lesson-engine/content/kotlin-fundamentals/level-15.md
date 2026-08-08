---
series: kotlin-fundamentals
level: 15
title: Generics
lang: kotlin
---

# Generics

`java-fundamentals` Level 19 covered Java generics in depth, including one of Java's genuinely confusing corners: wildcards, and the PECS mnemonic ("Producer Extends, Consumer Super") for remembering when to use `? extends T` versus `? super T`. Kotlin has the same underlying capability — but states it at the *class declaration*, once, instead of scattered across every call site that uses the type. This lesson covers Kotlin generics, ending with that specific, cleaner alternative to wildcards.

## Generic Functions and Classes

```kotlin
fun <T> firstOrNull(list: List<T>): T? {
    return if (list.isEmpty()) null else list[0]
}

class Box<T>(val contents: T) {
    fun describe(): String = "Box containing: $contents"
}

fun main() {
    println(firstOrNull(listOf(1, 2, 3)))
    println(firstOrNull(listOf<String>()))

    val intBox = Box(42)
    val stringBox = Box("hello")
    println(intBox.describe())
    println(stringBox.describe())
}
```

```text
1
null
Box containing: 42
Box containing: hello
```

**Walkthrough:** `fun <T> firstOrNull(list: List<T>): T?` declares `T` as a **type parameter** — a placeholder standing in for whatever real type is used at each call site. `firstOrNull(listOf(1, 2, 3))` infers `T = Int` from the argument; `firstOrNull(listOf<String>())` infers `T = String`. The return type `T?` (nullable) is deliberate — an empty list has no first element, and Level 3's null-safety rules mean that possibility has to be represented in the type, exactly like Level 6's `Map` lookups. `class Box<T>(val contents: T)` is a generic class — `Box<Int>` and `Box<String>` are different, fully type-checked instantiations of the same one class definition, exactly like Java's own `ArrayList<Int>` versus `ArrayList<String>`.

## Bounded Type Parameters

```kotlin
fun <T : Comparable<T>> maxOf(a: T, b: T): T {
    return if (a > b) a else b
}

fun main() {
    println(maxOf(10, 20))
    println(maxOf("apple", "banana"))
}
```

```text
20
banana
```

**Walkthrough:** `<T : Comparable<T>>` is a **bounded type parameter** — it restricts `T` to only types that implement `Comparable<T>`, which is what makes `a > b` legal inside the function body (`>` on a generic `T` would otherwise be meaningless — the compiler has no idea whether an arbitrary type supports ordering at all). `Int` and `String` both implement `Comparable` in Kotlin's standard library, so both calls compile; a hypothetical type with no natural ordering would be rejected by the compiler at the call site, not at runtime.

## Variance: out and in, Declared Once

```kotlin
// A read-only producer: it only ever RETURNS T, never accepts one as a parameter.
interface Producer<out T> {
    fun produce(): T
}

class AnimalShelter : Producer<Animal> {
    override fun produce(): Animal = Animal("Generic Animal")
}

class DogShelter : Producer<Dog> {
    override fun produce(): Dog = Dog("Rex")
}

open class Animal(val name: String)
class Dog(name: String) : Animal(name)

fun printProduced(producer: Producer<Animal>) {
    println(producer.produce().name)
}

fun main() {
    // A Producer<Dog> can be used wherever a Producer<Animal> is expected —
    // legal ONLY because Producer declared <out T> once, up front.
    printProduced(DogShelter())
    printProduced(AnimalShelter())
}
```

```text
Rex
Generic Animal
```

**Walkthrough:** `interface Producer<out T>` marks `T` as **covariant** using the `out` keyword — declared exactly once, on the interface itself. This states, permanently, "every use of `T` in this interface only ever appears as a return type (a producer position), never as a parameter type," which is precisely what makes `Producer<Dog>` safely usable anywhere a `Producer<Animal>` is expected: every `Dog` genuinely *is* an `Animal` (Level 11's inheritance), so anything that only ever *hands you* a `T` can safely hand you a more specific one instead.

**SE lens:** This is Kotlin's alternative to Java's `? extends T` wildcard from `java-fundamentals` Level 19's PECS mnemonic — "Producer Extends." Java requires writing `List<? extends Animal>` at *every single call site* that needs this flexibility, and a caller has to correctly remember which direction (`extends` or `super`) applies each time. Kotlin's `out T`, declared once on `Producer` itself, means every caller everywhere automatically gets the correct, safe variance — there's no wildcard to get backwards, because the choice was made once, by the type's own author, not re-decided at every use.

## Recognition

```text
Today: generic functions/classes, bounded type parameters, declaration-site variance

Also recognized in: Java's own generics and PECS wildcards (Level 19 of
java-fundamentals — what Kotlin's out/in replaces), C#'s out/in variance
keywords (nearly identical syntax and meaning to Kotlin's, both stated at
declaration site), and Scala's +T/-T variance annotations, which directly
inspired Kotlin's own out/in choice.
```

## Challenge: generic_stack

Write `class Stack<T>` with:
- `fun push(item: T)` — adds an item to the top
- `fun pop(): T?` — removes and returns the top item, or `null` if empty
- `fun peek(): T?` — returns the top item without removing it, or `null` if empty
- `fun isEmpty(): Boolean`

Store the items internally in a `MutableList<T>` (Level 6).

```challenge
class Stack<T> {
    private val items = mutableListOf<T>()

    fun push(item: T) {
    }

    fun pop(): T? {
        return null
    }

    fun peek(): T? {
        return null
    }

    fun isEmpty(): Boolean {
        return true
    }
}
```

```test
val stack = Stack<Int>()
assert stack.isEmpty()
assert stack.pop() == null

stack.push(1)
stack.push(2)
stack.push(3)
assert stack.isEmpty() == false
assert stack.peek() == 3

assert stack.pop() == 3
assert stack.peek() == 1
```
