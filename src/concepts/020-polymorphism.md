---
concept: 020-polymorphism
name: Polymorphism
---

## Definition

Polymorphism means code can call the same method on different types of objects,
and each one responds with its own specific behavior, without the calling code
needing to know which exact type it's dealing with.

## Problem

Without polymorphism, code that needs to handle several related types (different
shapes, different payment methods) has to check "what type is this?" explicitly
every time, with a branch for each — adding a new type means finding and updating
every one of those checks throughout the codebase.

## Execution

Loop calls shape.area() for each shape in list
↓
Item is a Circle → Circle's own area() runs → πr²
↓
Item is a Rectangle → Rectangle's own area() runs → width × height
↓
Item is a Triangle → Triangle's own area() runs → ½ × base × height
↓
Same call site (shape.area()) — different code actually executes each time,
decided by the object's real type, not by the loop

## Computer Science

Calling `shape.area()` doesn't look up a fixed function — it looks up the *actual*
object's own version at the moment the call happens, a mechanism called **dynamic
dispatch**. This is different from choosing which function to call based on the
declared type of a variable, which is fixed at compile time.

Tags: Dynamic dispatch, Virtual methods, Late binding, Contracts

## Software Engineering

Polymorphism is what makes the open/closed principle possible — you can add a new
`Shape` subclass with its own `area()` implementation without modifying any of the
existing code that already loops over shapes calling `.area()`. That existing loop
is closed for modification, but open for this kind of extension.

Tags: Open/closed principle, Extensibility, Reduced branching

## Common Mistakes

- Writing an explicit `if (shape instanceof Circle) { ... } else if (shape instanceof Rectangle) { ... }` chain instead of overriding a shared method — this defeats the entire purpose and needs updating every time a new type is added.
- Forgetting to override a method in a subclass, silently inheriting a default behavior that doesn't make sense for that specific subclass.

## Exercises

- Add a `Triangle` class in each language with its own `area()` and add an instance to the list — confirm the loop handles it with zero changes to the loop itself.
- Predict, before running, what the JavaScript example prints if you add a plain object literal (not a class instance) with an `area` property that's a number, not a method, to the array.

## javascript

```javascript
class Circle {
  constructor(radius) { this.radius = radius }
  area() { return Math.PI * this.radius ** 2 }
}
class Rectangle {
  constructor(w, h) { this.w = w; this.h = h }
  area() { return this.w * this.h }
}

const shapes = [new Circle(2), new Rectangle(3, 4)]
for (const shape of shapes) {
  console.log(shape.area())   // 12.57..., then 12
}
```
Walkthrough: the loop calls `shape.area()` identically for every item, with no
`if` checking what kind of shape it is. Each object's own `area()` runs — the
`Circle`'s formula for the first item, the `Rectangle`'s for the second — decided
by the object itself, not by the loop.

## python

```python
class Circle:
    def __init__(self, radius): self.radius = radius
    def area(self): return 3.14159 * self.radius ** 2

class Rectangle:
    def __init__(self, w, h): self.w = w; self.h = h
    def area(self): return self.w * self.h

shapes = [Circle(2), Rectangle(3, 4)]
for shape in shapes:
    print(shape.area())   # 12.566..., then 12
```
Walkthrough: same dynamic dispatch as JavaScript's version. Python doesn't require
`Circle` and `Rectangle` to share a common declared parent class or interface for
this to work at all — this is Python's **duck typing**: if an object has an
`area()` method, it works in this loop, regardless of its class hierarchy.

## java

```java
interface Shape { double area(); }

class Circle implements Shape {
    double radius;
    Circle(double r) { radius = r; }
    public double area() { return Math.PI * radius * radius; }
}
class Rectangle implements Shape {
    double w, h;
    Rectangle(double w, double h) { this.w = w; this.h = h; }
    public double area() { return w * h; }
}

Shape[] shapes = { new Circle(2), new Rectangle(3, 4) };
for (Shape shape : shapes) {
    System.out.println(shape.area());
}
```
Walkthrough: unlike Python's duck typing, Java requires `Circle` and `Rectangle`
to both formally declare `implements Shape` — the compiler checks this
relationship exists before allowing them into a `Shape[]` array at all. The
dynamic dispatch itself (which `area()` actually runs) still happens at runtime,
the same as the other two languages — Java just adds a compile-time guarantee on
top that the object really does have the method being called.
