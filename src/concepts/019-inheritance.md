---
concept: 019-inheritance
name: Inheritance
---

## Definition

Inheritance lets one class (a subclass) reuse the fields and methods of another
class (a superclass), adding or overriding only what's actually different.

## Problem

Without inheritance, two closely related classes — `Car` and `Truck`, both
"vehicles" with a speed and a `drive()` method — would each need their own copy of
every shared behavior, and a fix to that shared behavior would need to be applied
in both places.

## Computer Science

A subclass instance genuinely **is a** superclass instance — a `Car` object really
does have every field and method a `Vehicle` has, plus whatever `Car` adds. This
"is-a" relationship is what makes it valid to use a `Car` anywhere a `Vehicle` is
expected (see Polymorphism).

Tags: Is-a relationship, Class hierarchy, Method overriding

## Software Engineering

Deep inheritance chains (a class inheriting from a class inheriting from a class,
several levels deep) are a well-known source of fragility — a change to a
superclass several levels up can have effects that are hard to trace through every
level in between. Many teams deliberately favor composition — building behavior
out of smaller, combined objects — over inheritance for exactly this reason.

Tags: Fragile base class, Composition over inheritance, Class hierarchy depth

## Common Mistakes

- Using inheritance purely to reuse code between two classes that aren't actually in an "is-a" relationship — a `Stack` that "inherits from" `ArrayList` just to reuse its methods, even though a stack isn't really a kind of list, is a commonly cited example of this misuse.
- Overriding a method but forgetting to call the superclass's version when it still needed to run part of the original behavior.

## Exercises

- In the JavaScript example, add a `Truck` class that also extends `Vehicle` and give it its own `describe()` override.
- Remove the `@Override` annotation in the Java example (it's optional) and confirm the code still behaves identically — it's a compiler safety check, not required syntax.

## javascript

```javascript
class Vehicle {
  constructor(speed) {
    this.speed = speed
  }
  describe() {
    return `Moving at ${this.speed} mph`
  }
}

class Car extends Vehicle {
  describe() {
    return `Car: ${super.describe()}`
  }
}

const car = new Car(60)
console.log(car.describe())   // "Car: Moving at 60 mph"
```
Walkthrough: `class Car extends Vehicle` makes `Car` a subclass — every `Car`
instance has the `speed` field and inherited behavior from `Vehicle`. `describe()`
is overridden in `Car`, but `super.describe()` explicitly calls `Vehicle`'s
original version first, then adds to its result rather than replacing it entirely.

## python

```python
class Vehicle:
    def __init__(self, speed):
        self.speed = speed

    def describe(self):
        return f"Moving at {self.speed} mph"

class Car(Vehicle):
    def describe(self):
        return f"Car: {super().describe()}"

car = Car(60)
print(car.describe())   # "Car: Moving at 60 mph"
```
Walkthrough: `class Car(Vehicle):` is Python's inheritance syntax — the parent
class in parentheses after the subclass name. `super().describe()` calls the
parent's version, the same role `super.describe()` plays in JavaScript.

## java

```java
class Vehicle {
    int speed;
    Vehicle(int speed) { this.speed = speed; }
    String describe() { return "Moving at " + speed + " mph"; }
}

class Car extends Vehicle {
    Car(int speed) { super(speed); }
    @Override
    String describe() { return "Car: " + super.describe(); }
}

Car car = new Car(60);
System.out.println(car.describe());   // "Car: Moving at 60 mph"
```
Walkthrough: `Car(int speed) { super(speed); }` explicitly calls the superclass's
constructor first — Java requires this be the first line of a subclass
constructor whenever the superclass constructor needs arguments, a requirement
neither JavaScript nor Python enforces this strictly (though both have their own
equivalent call). `@Override` is an optional compiler check confirming this method
really does override something in the superclass — it catches a real class of
typo bugs (misspelling a method name meant to override) at compile time.
