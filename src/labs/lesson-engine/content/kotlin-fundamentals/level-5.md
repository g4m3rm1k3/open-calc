---
series: kotlin-fundamentals
level: 5
title: Data Classes
lang: kotlin
---

# Data Classes

`java-fundamentals` Level 18 spent a full lesson on `equals()`, `hashCode()`, and `toString()` — three methods every Java class needs for correct behavior in collections and debugging, and three methods Java makes you override by hand, correctly, every single time. Kotlin's **data class** generates all three automatically from a class's constructor properties, plus one more method Java has no equivalent for at all: `copy()`.

## The Problem, Restated in Kotlin

```kotlin
class Point(val x: Int, val y: Int)

fun main() {
    val p1 = Point(3, 4)
    val p2 = Point(3, 4)

    println(p1 == p2)                       // false! == calls equals(), and ordinary classes don't override it
    println(p1.toString().startsWith("Point@"))  // true — the default toString() is just the class name plus a memory address
}
```

```text
false
true
```

**Walkthrough:** `p1 == p2` prints `false` even though `p1` and `p2` hold identical `x` and `y` values, because Kotlin's `==` calls `equals()` — same as Java's `.equals()` — and an ordinary `class` with no overridden `equals()` inherits the default: two objects are equal only if they are the exact same object in memory (**reference equality**), not merely holding the same data (**structural equality**). `p1.toString()` similarly inherits an unhelpful default — a string that looks like `Point@1b6d3586`, the class name followed by an `@` and a memory-address-derived hash — the second `println` here just checks that it *starts with* `"Point@"` rather than printing the address itself, since that hash is different on every single run and isn't something a lesson can show as fixed, predictable output.

## data class — All Three, Generated

```kotlin
data class Point(val x: Int, val y: Int)

fun main() {
    val p1 = Point(3, 4)
    val p2 = Point(3, 4)

    println(p1 == p2)   // true — structural equality, generated automatically
    println(p1)          // Point(x=3, y=4) — a real, readable toString()
}
```

```text
true
Point(x=3, y=4)
```

**Walkthrough:** Adding the single word `data` before `class` changes everything: `p1 == p2` is now `true`, because the compiler generated a real `equals()` that compares every constructor property (`x` and `y`) for equality. `println(p1)` now prints `Point(x=3, y=4)` — a real, generated `toString()` listing every property by name. Nothing else about the class changed; `data class Point(val x: Int, val y: Int)` is still exactly one line.

**CS lens:** This is **structural equality versus reference equality**, made the *default* for data classes specifically because most real data-holding objects — a coordinate, a user record, an order line — should be compared by their content, not their identity. `java-fundamentals` Level 18 taught you to write this by hand: a correct `equals()` compares every field with matching types and handles `null` safely; a correct `hashCode()` combines the same fields consistently (so that equal objects always hash identically, which every `HashMap` and `HashSet` depends on internally). `data class` generates both from the constructor's properties automatically, and generates them *correctly* — no risk of the classic Java bug where `equals()` is overridden but `hashCode()` is accidentally left as the default, silently breaking every `HashMap` that ever stores the object.

## copy() — Immutable Updates Without Mutation

```kotlin
data class Order(val customerEmail: String, val total: Double, val status: String)

fun main() {
    val order = Order("alice@example.com", 79.99, "PLACED")

    // copy() builds a NEW object, changing only the properties you name.
    val shipped = order.copy(status = "SHIPPED")

    println(order)
    println(shipped)
}
```

```text
Order(customerEmail=alice@example.com, total=79.99, status=PLACED)
Order(customerEmail=alice@example.com, total=79.99, status=SHIPPED)
```

**Walkthrough:** `order.copy(status = "SHIPPED")` builds an entirely new `Order` object, copying every property from `order` except `status`, which is set to `"SHIPPED"` instead. `order` itself is completely unaffected — it still prints `status=PLACED` after the copy, because `copy()` never mutates the original. This is exactly the same pattern `java-architecture` Level 5's `TaskManager.completeTask` challenge used by hand — "completing" a task by building a new immutable `Task` record rather than mutating the old one — except `copy()` means you don't have to write out every unchanged field yourself; you name only the ones actually changing.

**SE lens:** `copy()` is what makes `val`-only, fully immutable data classes practical to use throughout a real codebase instead of just in isolated examples. Without it, "update one field on an otherwise-immutable object" would require manually reconstructing the whole object every time, naming every unchanged property — exactly the kind of repetitive, error-prone code Kotlin exists to eliminate. Immutable data plus cheap, targeted copies is the same design Level 5's `State` pattern in `java-architecture` relied on implicitly; `copy()` is Kotlin's language-level support for that style.

## Destructuring Declarations

```kotlin
data class Point(val x: Int, val y: Int)

fun main() {
    val point = Point(10, 20)

    // Destructuring: unpack a data class's properties into separate variables at once.
    val (x, y) = point
    println("x=$x, y=$y")

    // Also works directly in a for loop over a list of data class instances:
    val points = listOf(Point(1, 1), Point(2, 4), Point(3, 9))
    for ((px, py) in points) {
        println("point at $px,$py")
    }
}
```

```text
x=10, y=20
point at 1,1
point at 2,4
point at 3,9
```

**Walkthrough:** `val (x, y) = point` is a **destructuring declaration** — it unpacks `point`'s properties into two separate new variables, `x` and `y`, in one line, in the order the data class declared them (`x` first, then `y`, matching `Point(val x: Int, val y: Int)`). This works because a `data class` automatically generates `component1()`, `component2()`, and so on — one per constructor property — and destructuring syntax is just sugar for calling those in order. The `for ((px, py) in points)` loop shows the same mechanism working over every element of a list at once.

## Recognition

```text
Today: data class — generated equals/hashCode/toString/copy/componentN

Also recognized in: Java 17's own record keyword (added years after
Kotlin, doing almost exactly this — Java caught up specifically because
this pattern proved this valuable), Python's @dataclass decorator and
namedtuple, Scala's case class (Kotlin's most direct ancestor for this
feature), and C#'s record type, added in C# 9 for the same reason.
```

## Challenge: inventory_item

Write `data class InventoryItem(val sku: String, val name: String, val quantity: Int, val unitPrice: Double)`. Then write `fun restock(item: InventoryItem, additionalUnits: Int): InventoryItem` that returns a new `InventoryItem` with `quantity` increased by `additionalUnits`, using `copy()` — not manual reconstruction.

```challenge
data class InventoryItem(val sku: String, val name: String, val quantity: Int, val unitPrice: Double)

fun restock(item: InventoryItem, additionalUnits: Int): InventoryItem {
    return item
}
```

```test
val item = InventoryItem("SKU-1", "Widget", 10, 4.99)
val restocked = restock(item, 5)

assert restocked.quantity == 15
assert restocked.sku == "SKU-1"
assert restocked.name == "Widget"
assert item.quantity == 10
assert restocked == restocked.copy()
assert item != restocked
```
