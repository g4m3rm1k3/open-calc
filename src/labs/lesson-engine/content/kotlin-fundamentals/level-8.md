---
series: kotlin-fundamentals
level: 8
title: Collection Operations
lang: kotlin
---

# Collection Operations

`java-fundamentals` Level 16 introduced the Stream API — `.stream().filter(...).map(...).collect(...)` — as a way to process collections without hand-written loops. Kotlin's collections have the same functional operations built directly onto them, as ordinary methods, with no separate "stream" type or terminal `.collect()` step required. This lesson covers the small set of operations that cover most real collection processing.

## map — Transform Every Element

```kotlin
fun main() {
    val numbers = listOf(1, 2, 3, 4, 5)

    val doubled = numbers.map { it * 2 }
    val asStrings = numbers.map { "Number: $it" }

    println(doubled)
    println(asStrings)
}
```

```text
[2, 4, 6, 8, 10]
[Number: 1, Number: 2, Number: 3, Number: 4, Number: 5]
```

**Walkthrough:** `numbers.map { it * 2 }` runs the trailing lambda `{ it * 2 }` once per element of `numbers`, collecting the results into a brand-new `List` — `numbers` itself is completely unchanged (it's a read-only `List`, per Level 6, so it couldn't be modified even if `map` tried). `it` refers to the current element on each call, exactly as Level 7 introduced. `map` never removes or reorders elements — the output list always has exactly as many elements as the input, one output per input, in the same order.

**CS lens:** `map` is one of the oldest ideas in functional programming — apply a function to every element of a collection, producing a new collection of the results — present under this same name in Lisp, Haskell, Python, JavaScript, and Java's own `Stream.map`. Learning it once here transfers directly to every one of those languages.

## filter — Keep Only Matching Elements

```kotlin
fun main() {
    val numbers = listOf(1, 2, 3, 4, 5, 6, 7, 8, 9, 10)

    val evens = numbers.filter { it % 2 == 0 }
    val bigOnes = numbers.filter { it > 7 }

    println(evens)
    println(bigOnes)
}
```

```text
[2, 4, 6, 8, 10]
[8, 9, 10]
```

**Walkthrough:** `numbers.filter { it % 2 == 0 }` runs the lambda once per element, keeping only the elements where it returns `true` — the lambda passed to `filter` must return `Boolean`, unlike `map`'s lambda, which can return anything. `%` is the **modulo operator**, giving the remainder of division — `it % 2 == 0` is `true` exactly when `it` is even. Like `map`, `filter` never mutates `numbers`; it returns an entirely new `List` containing only the matching elements, in their original relative order.

## Chaining map and filter Together

```kotlin
fun main() {
    val numbers = listOf(1, 2, 3, 4, 5, 6, 7, 8, 9, 10)

    val result = numbers
        .filter { it % 2 == 0 }   // [2, 4, 6, 8, 10]
        .map { it * it }          // [4, 16, 36, 64, 100]

    println(result)
}
```

```text
[4, 16, 36, 64, 100]
```

**Walkthrough:** Because `filter` returns a `List` and `map` is a method *on* `List`, the two chain directly: `numbers.filter { ... }.map { ... }` first keeps only even numbers, then squares each of the survivors. Each step produces a fresh, complete intermediate list before the next step runs — `filter` builds `[2, 4, 6, 8, 10]` fully, then `map` runs over that. This differs from Java's `Stream` API, where `.filter().map()` is lazily evaluated element-by-element in a single pass — a real difference in *how* the work happens, though the end result is identical either way. For collections small enough to fit in memory (nearly everything a lesson or a typical application deals with), this distinction rarely matters in practice.

## reduce and fold — Collapsing to One Value

```kotlin
fun main() {
    val numbers = listOf(1, 2, 3, 4, 5)

    val sum = numbers.reduce { acc, n -> acc + n }
    println(sum)

    // fold is like reduce, but with an explicit starting value —
    // works even on an empty list, which reduce cannot handle.
    val sumWithBonus = numbers.fold(100) { acc, n -> acc + n }
    println(sumWithBonus)

    val product = numbers.fold(1) { acc, n -> acc * n }
    println(product)
}
```

```text
15
115
120
```

**Walkthrough:** `numbers.reduce { acc, n -> acc + n }` combines every element into a single value: `acc` (short for "accumulator") starts as the list's first element (`1`), then on each subsequent element `n`, `acc` becomes `acc + n` — `1`, then `1+2=3`, then `3+3=6`, then `6+4=10`, then `10+5=15`. `fold(100) { acc, n -> acc + n }` works the same way but starts `acc` at `100` instead of the list's first element, giving `100+1+2+3+4+5=115`; `fold(1) { acc, n -> acc * n }` computes a factorial-like product, `1*1*2*3*4*5=120`. `fold` additionally handles an empty list gracefully (returning the starting value unchanged), while `reduce` on an empty list throws, since it has no first element to start from.

**SE lens:** `map`, `filter`, and `fold`/`reduce` together cover the large majority of what a hand-written `for` loop over a collection would otherwise do — transform, select, and summarize. Reaching for these instead of a loop states the *intent* directly in the code (`filter` says "I'm selecting," `fold` says "I'm summarizing") rather than making a reader trace through loop-and-accumulator mechanics to infer the same intent.

## sortedBy and groupBy

```kotlin
data class Person(val name: String, val age: Int)

fun main() {
    val people = listOf(Person("Carol", 35), Person("Alice", 30), Person("Bob", 25))

    val byAge = people.sortedBy { it.age }
    println(byAge.map { it.name })

    val grouped = people.groupBy { if (it.age >= 30) "senior" else "junior" }
    println(grouped)
}
```

```text
[Bob, Alice, Carol]
{senior=[Person(name=Carol, age=35), Person(name=Alice, age=30)], junior=[Person(name=Bob, age=25)]}
```

**Walkthrough:** `people.sortedBy { it.age }` returns a new list sorted in ascending order by whatever the lambda returns for each element — here, `age` — leaving `people` itself unchanged. `people.groupBy { ... }` partitions the list into a `Map` whose keys are whatever the lambda returns, and whose values are lists of every original element that produced that key — every person with `age >= 30` lands under the key `"senior"`, everyone else under `"junior"`.

## Recognition

```text
Today: map, filter, reduce/fold, sortedBy, groupBy

Also recognized in: Java's Stream API (.map/.filter/.reduce/.collect —
the direct predecessor Kotlin's collection operations were designed to
simplify), Python's map()/filter()/functools.reduce and list
comprehensions, JavaScript's Array.prototype.map/filter/reduce, and SQL's
SELECT/WHERE/GROUP BY — the same three ideas (transform, select,
aggregate) recur as the core vocabulary of data processing in every
language and query system that has to describe "do something to every
row."
```

## Challenge: shopping_cart_total

Given `data class CartItem(val name: String, val price: Double, val quantity: Int, val isGift: Boolean)`, write `fun cartTotal(items: List<CartItem>): Double` that returns the total cost (`price * quantity` summed across every item) of only the items where `isGift` is `false` — gift items contribute nothing to the total. Use `filter` and `fold` (or `sumOf`), not a hand-written loop.

```challenge
data class CartItem(val name: String, val price: Double, val quantity: Int, val isGift: Boolean)

fun cartTotal(items: List<CartItem>): Double {
    return 0.0
}
```

```test
val items = listOf(
    CartItem("Book", 15.0, 2, false),
    CartItem("Pen", 2.0, 3, false),
    CartItem("Sticker", 1.0, 5, true)
)
assert cartTotal(items) == 36.0

val allGifts = listOf(CartItem("Card", 5.0, 1, true))
assert cartTotal(allGifts) == 0.0

val empty = listOf<CartItem>()
assert cartTotal(empty) == 0.0

val single = listOf(CartItem("Mug", 10.0, 4, false))
assert cartTotal(single) == 40.0
```
