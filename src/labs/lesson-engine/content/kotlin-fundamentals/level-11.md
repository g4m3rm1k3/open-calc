---
series: kotlin-fundamentals
level: 11
title: Inheritance & Interfaces
lang: kotlin
---

# Inheritance & Interfaces

Java classes are inheritable by default — you have to write `final` to stop it. Kotlin inverts that default: every class is effectively `final` unless you explicitly mark it `open`, and every member is non-overridable unless explicitly marked `open` too. This lesson covers inheritance and interfaces in Kotlin, and why that inverted default is considered one of the language's more deliberate design decisions.

## Classes Are Closed by Default

```kotlin
// class Animal { }          // NOT inheritable — this is the default
open class Animal(val name: String) {   // open = "this class CAN be subclassed"
    open fun makeSound(): String = "..."   // open = "this method CAN be overridden"

    fun describe(): String = "$name says ${makeSound()}"
}

class Dog(name: String) : Animal(name) {
    override fun makeSound(): String = "Woof"
}

class Cat(name: String) : Animal(name) {
    override fun makeSound(): String = "Meow"
}

fun main() {
    val dog = Dog("Rex")
    val cat = Cat("Whiskers")

    println(dog.describe())
    println(cat.describe())
}
```

```text
Rex says Woof
Whiskers says Meow
```

**Walkthrough:** `open class Animal(name: String)` explicitly allows subclassing — without `open`, `class Dog(name: String) : Animal(name)` would fail to compile entirely. `open fun makeSound()` explicitly allows overriding that specific method — every other method (`describe`, here) stays non-overridable by default even inside an `open` class, unless marked `open` individually too. `class Dog(name: String) : Animal(name)` uses `:` (not `extends`, like Java) to declare inheritance, immediately calling `Animal`'s own constructor with `name`. `override fun makeSound()` — the `override` keyword is **required**, not optional the way Java's `@Override` annotation is; leaving it off when replacing an `open` member is a compile error, not a silently-accepted convention.

**SE lens:** Josh Bloch's *Effective Java* — one of the most influential Java books ever written — has a whole item titled "Design and document for inheritance or else prohibit it," arguing that most classes are never actually designed to be safely subclassed, and allowing it by accident invites bugs. Kotlin's inverted default (`final` unless `open`) makes that advice the language's own enforced behavior: a class author has to make an active, visible decision — "yes, this can be extended" — rather than subclassing being a silent side effect of forgetting one keyword.

## Interfaces

```kotlin
interface Shape {
    fun area(): Double
    fun describe(): String = "A shape with area ${area()}"   // interfaces CAN have default implementations
}

class Circle(val radius: Double) : Shape {
    override fun area(): Double = Math.PI * radius * radius
}

class Rectangle(val width: Double, val height: Double) : Shape {
    override fun area(): Double = width * height
    override fun describe(): String = "A ${width}x${height} rectangle"   // overriding the default
}

fun main() {
    val shapes: List<Shape> = listOf(Circle(3.0), Rectangle(4.0, 5.0))
    for (shape in shapes) {
        println(shape.describe())
    }
}
```

```text
A shape with area 28.274333882308138
A 4.0x5.0 rectangle
```

**Walkthrough:** `interface Shape` declares `area()` with no body (every implementing class must provide one) and `describe()` *with* a body — a **default implementation**, usable as-is or overridden. `Circle` uses the default `describe()` unchanged; `Rectangle` overrides it with something more specific. `val shapes: List<Shape> = listOf(Circle(3.0), Rectangle(4.0, 5.0))` holds both concrete types through their shared `Shape` interface type — this is the identical **polymorphism** `java-architecture` Level 4 built the entire Strategy pattern around: code that only knows about `Shape` calls `shape.describe()`, and the JVM dispatches to whichever concrete class's real implementation applies, decided at runtime.

**CS lens:** Java only gained default interface methods in Java 8 (2014) — before that, adding a new method to a published interface broke every existing implementation of it, forcing painful, coordinated updates across an entire ecosystem. Kotlin had default methods from its very first release, precisely because JetBrains watched that exact Java pain firsthand while building tools that depended on Java's own interfaces.

## A Class Implementing Multiple Interfaces

```kotlin
interface Flyable {
    fun fly(): String = "Flying"
}

interface Swimmable {
    fun swim(): String = "Swimming"
}

class Duck : Flyable, Swimmable

fun main() {
    val duck = Duck()
    println(duck.fly())
    println(duck.swim())
}
```

```text
Flying
Swimming
```

**Walkthrough:** `class Duck : Flyable, Swimmable` implements two interfaces at once, separated by a comma — Kotlin, like Java, allows a class to implement any number of interfaces (though it can only ever extend one class, since multiple *class* inheritance is what both languages deliberately forbid, for the classic diamond-inheritance ambiguity reasons `java-fundamentals`' interfaces lesson covers). `Duck` needs no body at all here — both `fly()` and `swim()` come entirely from the interfaces' own default implementations, with nothing left to override.

## Recognition

```text
Today: open vs final by default, override, interface default methods

Also recognized in: C++'s virtual keyword (methods are non-overridable
unless explicitly marked virtual — the same closed-by-default philosophy,
decades earlier), Rust's traits (no inheritance at all, only trait
implementation — an even stricter version of "favor composition"), and
Scala's traits, which directly inspired Kotlin's own interface design,
default methods included.
```

## Challenge: employee_hierarchy

Write `open class Employee(val name: String, protected val baseSalary: Double)` with `open fun calculatePay(): Double = baseSalary`. Then write `class Manager(name: String, baseSalary: Double, private val bonus: Double) : Employee(name, baseSalary)` overriding `calculatePay()` to return `baseSalary + bonus`.

```challenge
open class Employee(val name: String, protected val baseSalary: Double) {
    open fun calculatePay(): Double = baseSalary
}

class Manager(name: String, baseSalary: Double, private val bonus: Double) : Employee(name, baseSalary) {
    // TODO
}
```

```test
val employee = Employee("Alice", 50000.0)
assert employee.calculatePay() == 50000.0

val manager = Manager("Bob", 60000.0, 15000.0)
assert manager.calculatePay() == 75000.0
assert manager.name == "Bob"

val staff: List<Employee> = listOf(employee, manager)
assert staff.map { it.calculatePay() } == listOf(50000.0, 75000.0)
assert staff[1] is Manager
```
