---
series: kotlin-fundamentals
level: 4
title: Classes & Properties
lang: kotlin
---

# Classes & Properties

Java splits an object's data into two things you write separately: private fields, and public getter/setter methods that expose them (`getName()`, `setName(String name)`). Kotlin merges them into one concept — a **property** — declared once, with the getter and setter generated automatically unless you need to customize them. This lesson covers class declaration, constructors, and properties the Kotlin way.

## The Old Way, in Java, for Comparison

```text
// Java — a typical class with two fields needs this much code just for access:
class Person {
    private String name;
    private int age;

    public Person(String name, int age) {
        this.name = name;
        this.age = age;
    }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public int getAge() { return age; }
    public void setAge(int age) { this.age = age; }
}
```

That is fourteen lines to expose two fields with ordinary get/set access. Kotlin's equivalent is next.

## The Primary Constructor

```kotlin
class Person(val name: String, var age: Int)

fun main() {
    val alice = Person("Alice", 30)
    println("${alice.name} is ${alice.age}")

    alice.age = 31   // var property — reassignable
    println("${alice.name} is now ${alice.age}")
}
```

```text
Alice is 30
Alice is now 31
```

**Walkthrough:** `class Person(val name: String, var age: Int)` declares an entire class — including its constructor and both its properties — on one line. `val name: String` inside the parentheses is a **primary constructor parameter that is also a property**: writing `val` or `var` right there, in the parameter list, tells Kotlin "store this as a real property on every `Person`, readable as `alice.name`, not just a constructor argument that disappears once the object is built." `name` uses `val` (never reassignable after construction, matching Level 0's rule) while `age` uses `var` (reassignable, as `alice.age = 31` shows). `alice.name` and `alice.age` read like direct field access, but they are actually calling generated getter methods behind the scenes — Kotlin just never makes you write `getName()` or see that it's happening.

**CS lens:** This is exactly the same **encapsulation** idea from `java-architecture`'s `OrderRepository` (Level 2 of that series: hide the representation, expose it only through methods) — Kotlin just generates the getter/setter methods for you by default, instead of requiring you to hand-write `private String name; public String getName() { return name; }` every time. The encapsulation is still real and still there; the boilerplate to get it is gone.

## Custom Getters and Setters

```kotlin
class Rectangle(val width: Double, val height: Double) {
    val area: Double
        get() = width * height   // computed every time area is read — not stored

    val isSquare: Boolean
        get() = width == height
}

fun main() {
    val rect = Rectangle(4.0, 5.0)
    println("Area: ${rect.area}, square: ${rect.isSquare}")

    val square = Rectangle(3.0, 3.0)
    println("Area: ${square.area}, square: ${square.isSquare}")
}
```

```text
Area: 20.0, square: false
Area: 9.0, square: true
```

**Walkthrough:** `val area: Double` with `get() = width * height` on the next line is a property with a **custom getter** — there is no backing field storing `area` anywhere; every time code reads `rect.area`, the getter recomputes `width * height` fresh, from the current values of `width` and `height`. This looks like a stored field from the outside (`rect.area`, no parentheses, no method-call syntax) but behaves like a method that recalculates on every access — the caller can't tell the difference, and doesn't need to.

**SE lens:** This is the same principle Level 0's `OrderService.calculateTotal` in `java-architecture` embodied with an ordinary method — deriving a value from other data rather than storing and risking it going stale — except Kotlin's property syntax lets that derived value be *read* exactly like stored data (`rect.area`, not `rect.calculateArea()`), which keeps call sites clean while still guaranteeing `area` can never drift out of sync with `width` and `height`, because it's never actually stored at all.

## Secondary Constructors and init Blocks

```kotlin
class Order(val customerEmail: String, val total: Double) {
    val isLargeOrder: Boolean

    // init runs immediately after the primary constructor's parameters are set —
    // for validation, or computing a property that depends on more than one parameter.
    init {
        require(total > 0) { "Order total must be positive" }
        isLargeOrder = total > 100.0
        println("Created order for $customerEmail")
    }
}

fun main() {
    val order = Order("alice@example.com", 150.0)
    println("Large order: ${order.isLargeOrder}")

    try {
        Order("bob@example.com", -10.0)
    } catch (e: IllegalArgumentException) {
        println("Rejected: ${e.message}")
    }
}
```

```text
Created order for alice@example.com
Large order: true
Rejected: Order total must be positive
```

**Walkthrough:** `init { ... }` is an **initializer block** — code that runs as part of constructing the object, right where it appears relative to any property declarations before or after it. `require(total > 0) { "..." }` is a standard-library function: if its condition is `false`, it throws `IllegalArgumentException` with the given message — this is Kotlin's idiomatic replacement for Java's `if (total <= 0) throw new IllegalArgumentException(...)` guard clause from `java-architecture` Level 0, expressed as one line instead of two. `isLargeOrder` is declared without an initial value on its own line, then assigned inside `init` — legal because Kotlin only requires every `val` be assigned exactly once before the constructor finishes, not necessarily at the point of declaration.

## Recognition

```text
Today: properties (val/var with generated accessors), custom getters, init blocks

Also recognized in: C#'s auto-implemented properties (public string Name
{ get; set; } — the same fused field+accessor idea, Kotlin's clear
ancestor here), Swift's computed properties (var area: Double { return
width * height } — nearly identical syntax), and Python's @property
decorator, which retrofits the same "looks like a field, runs like a
method" behavior onto a language that didn't have it from the start.
```

## Challenge: bank_account

Write `class BankAccount(val owner: String, initialBalance: Double)` with:
- a read-only property `balance: Double`, initialized from `initialBalance` inside an `init` block that throws `IllegalArgumentException` if `initialBalance` is negative
- a computed property `isOverdrawn: Boolean` that is `true` when `balance < 0`
- a function `fun deposit(amount: Double)` that adds `amount` to `balance` (throw `IllegalArgumentException` if `amount` is not positive)

Since `balance` must change over the account's lifetime but should not be settable from outside the class, declare it as `var balance: Double = 0.0; private set` — a `var` with a public getter but a `private` setter, so only code inside `BankAccount` itself can reassign it.

```challenge
class BankAccount(val owner: String, initialBalance: Double) {
    var balance: Double = 0.0
        private set

    init {
        // TODO
    }

    val isOverdrawn: Boolean
        get() = false

    fun deposit(amount: Double) {
        // TODO
    }
}
```

```test
val account = BankAccount("Alice", 100.0)
assert account.balance == 100.0
assert account.isOverdrawn == false

account.deposit(50.0)
assert account.balance == 150.0

var threwOnNegativeInitial = false
try {
    BankAccount("Bob", -10.0)
} catch (e: IllegalArgumentException) {
    threwOnNegativeInitial = true
}
assert threwOnNegativeInitial

var threwOnBadDeposit = false
try {
    account.deposit(-5.0)
} catch (e: IllegalArgumentException) {
    threwOnBadDeposit = true
}
assert threwOnBadDeposit
```
