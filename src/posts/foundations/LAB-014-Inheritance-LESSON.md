# FOUNDATIONS — LAB-014 — Inheritance

**Series:** FOUNDATIONS — Part III: Object-Oriented Programming
**Environment:** Browser DevTools console (F12 → Console). All examples run directly there.
**Time:** 55–70 minutes.

---

## What You Will Build

A `Shape` superclass with a `describe()` method, and two subclasses — `Circle` and `Rectangle` — each of which overrides `area()` with the correct formula. A function that accepts any `Shape` and calls `area()` without knowing which concrete type it is. After this lab, you will be able to read any `extends`/`super` code, explain the is-a relationship it establishes, and understand the critical condition under which inheritance becomes a liability (the Liskov Substitution Principle, covered in LAB-050).

---

## What You Need to Know First

**From LAB-012 (Classes):** How to define a class with a constructor and instance methods.

**From LAB-013 (Encapsulation):** Private fields (`#field`) are not inherited — subclasses cannot access the parent's private fields. If the parent has a private field that the subclass needs to interact with, it must do so through the parent's public or protected methods.

---

> **Quick Check — try to answer before reading:**
>
> 1. You have a `Vehicle` class with an `accelerate()` method. A `Car` class extends it. Does `Car` get `accelerate()` for free, or does it have to define it again?
> 2. What does `super(arg)` do when called inside a subclass constructor?
> 3. A `Square` extends `Rectangle`. `Rectangle` has `setWidth(w)` and `setHeight(h)` methods. If you call `setWidth(5)` on a `Square`, what should happen to the height?
>
> *(Answers at the end of this lab)*

---

## The Lesson

---

### Step 1 — Extending a Class

**The problem this step solves:** Share common behavior between related classes without duplicating code.

**The code:**

```js
class Shape {
  constructor(color) {
    this.color = color;
  }

  describe() {
    return `A ${this.color} shape with area ${this.area().toFixed(2)}`;
  }

  area() {
    throw new Error("area() must be implemented by a subclass");
  }
}

class Circle extends Shape {
  constructor(color, radius) {
    super(color);         // calls Shape's constructor — REQUIRED before using 'this'
    this.radius = radius;
  }

  area() {
    return Math.PI * this.radius * this.radius;
  }
}

class Rectangle extends Shape {
  constructor(color, width, height) {
    super(color);
    this.width = width;
    this.height = height;
  }

  area() {
    return this.width * this.height;
  }
}

const circle    = new Circle("red", 5);
const rectangle = new Rectangle("blue", 4, 6);

console.log(circle.describe());      // → "A red shape with area 78.54"
console.log(rectangle.describe());   // → "A blue shape with area 24.00"
```

**`class Circle extends Shape`** — the `extends` keyword establishes inheritance. `Circle` is the **subclass** (also called **child class**); `Shape` is the **superclass** (also called **parent class** or **base class**). `Circle` inherits all public methods and properties from `Shape`. This includes `describe()` and `color`.

**`super(color)`** — inside a subclass constructor, `super(arguments)` calls the superclass constructor. In `Circle`, `super(color)` calls `Shape`'s constructor, which sets `this.color = color`. The rule: in any subclass constructor, `super()` **must be called before any reference to `this`**. Accessing `this` before `super()` throws `ReferenceError: Must call super constructor in derived class before accessing 'this'`. This is because `this` does not exist until the parent constructor has run and created the object.

**The walkthrough — `circle.describe()` executes:**

1. `circle.describe()` is called. JavaScript looks for `describe` on `Circle`. Not found there.
2. JavaScript walks up the **prototype chain** to `Shape`. Finds `describe` there.
3. `describe` runs with `this = circle`. It calls `this.area()`.
4. JavaScript looks for `area` on `circle`. `Circle` defines `area` — it is found immediately (no need to go up to `Shape`).
5. `Circle`'s `area` returns `Math.PI * 5 * 5 = 78.539...`.
6. `describe` returns `` `A red shape with area 78.54` ``.

**CS lens — the prototype chain:**

JavaScript uses a **prototype chain** for inheritance. Each object has an internal link to a prototype object. When a property or method is not found on an object, JavaScript follows the prototype chain upward. `circle.__proto__` is `Circle.prototype`. `Circle.prototype.__proto__` is `Shape.prototype`. `Shape.prototype.__proto__` is `Object.prototype`. Traversing this chain is how `circle.describe()` finds `describe` on `Shape.prototype`. The `class`/`extends` syntax creates and configures this prototype chain automatically.

**SE lens — is-a relationships:**

Inheritance models an **is-a** relationship. `Circle` IS-A `Shape`. Every `Circle` is a `Shape`. This means: any code written to work with `Shape` also works with `Circle`. The `describe()` method on `Shape` calls `this.area()`. Because `Circle` defines `area()`, `describe()` on a `Circle` works correctly — even though `Shape` was written before `Circle` existed. This is **polymorphism through inheritance**, which you will study formally in LAB-015.

**What breaks if `super()` is omitted:**

```js
class Circle extends Shape {
  constructor(color, radius) {
    // super(color);  // OMITTED
    this.radius = radius;   // ReferenceError: must call super first
  }
}
```

`ReferenceError` is thrown immediately. This is not a runtime bug — it is caught as soon as the constructor tries to use `this`. The enforcement is by design: the parent constructor must initialize the object before the child adds to it.

---

### SAVE AND TRY

```js
const shapes = [
  new Circle("red", 5),
  new Rectangle("blue", 4, 6),
  new Circle("green", 3),
  new Rectangle("orange", 10, 2),
];

shapes.forEach(shape => console.log(shape.describe()));
```

Expected: four `describe()` lines, each with the correct area for its type.

**Change something:** Add a third subclass:

```js
class Triangle extends Shape {
  constructor(color, base, height) {
    super(color);
    this.base = base;
    this.height = height;
  }

  area() {
    return 0.5 * this.base * this.height;
  }
}
```

Add `new Triangle("yellow", 6, 4)` to the shapes array. Expected: `"A yellow shape with area 12.00"`. Notice that the `forEach` loop and the `describe()` method did not need to change — a new subclass extends the system without modifying existing code.

---

### Step 2 — Method Overriding and `super` in Methods

**The problem this step solves:** Override an inherited method to provide specialized behavior, while optionally reusing the parent's version.

**The code:**

```js
class Animal {
  constructor(name) {
    this.name = name;
  }

  speak() {
    return `${this.name} makes a sound.`;
  }

  describe() {
    return `${this.name} is an animal.`;
  }
}

class Dog extends Animal {
  speak() {
    // Override: Dog speaks differently from a generic Animal
    return `${this.name} barks.`;
  }

  describe() {
    // Use super.describe() to get the parent's string, then extend it
    const parentDescription = super.describe();
    return `${parentDescription} It is a dog.`;
  }
}

class Cat extends Animal {
  speak() {
    return `${this.name} meows.`;
  }
}

const dog = new Dog("Rex");
const cat = new Cat("Whiskers");

console.log(dog.speak());      // → "Rex barks."
console.log(cat.speak());      // → "Whiskers meows."
console.log(dog.describe());   // → "Rex is an animal. It is a dog."
console.log(cat.describe());   // → "Whiskers is an animal."  (inherits unchanged)
```

**Method overriding:** When a subclass defines a method with the same name as a superclass method, the subclass method **overrides** (replaces) the superclass method for all instances of the subclass. `dog.speak()` calls `Dog`'s `speak`, not `Animal`'s. `cat.speak()` calls `Cat`'s `speak`, not `Animal`'s. `Animal`'s `speak` is still there — it can be accessed with `super.speak()` — but it is no longer the default for subclass instances.

**`super.methodName()`** — inside an instance method, `super.methodName()` calls the superclass's version of that method. Used in `Dog.describe()` to get `"Rex is an animal."` from `Animal.describe()` and then append to it. This avoids duplicating the parent's logic while extending it.

**`Cat` does not override `describe()`:** `cat.describe()` calls `Animal.describe()` because `Cat` does not define its own `describe`. The prototype chain resolves to `Animal.prototype.describe` automatically.

**CS lens — virtual dispatch:**

When `cat.speak()` is called, JavaScript does not know at call-writing time which `speak` to call — `Animal`'s or a subclass's. The decision is made at runtime, based on the actual type of the object. This is called **virtual dispatch** or **dynamic dispatch**. It is what makes polymorphism work: the same call expression (`speak()`) can invoke different code depending on the object's actual type.

**SE lens — the override contract:**

When you override a method, you take on the responsibility of honoring the parent's contract. If `Animal.speak()` promises to return a string describing the sound, `Dog.speak()` must also return a string. It must not return `null`, throw an exception for valid inputs, or do fundamentally different things. The Liskov Substitution Principle (LAB-050) formalizes this: a subclass must be fully substitutable for its parent.

**What breaks if the override violates the contract:**

```js
class SilentDog extends Animal {
  speak() {
    return null;   // Animal.speak() promised a string — returning null breaks the contract
  }
}

const animals = [new Dog("Rex"), new SilentDog("Ghost")];
animals.forEach(animal => console.log(animal.speak().toUpperCase()));
// → "REX BARKS."
// → TypeError: Cannot read properties of null (reading 'toUpperCase')
```

Code written for `Animal` assumed `speak()` returns a string (since `Animal.speak()` does). `SilentDog` broke that assumption. This is an LSP violation — the subclass cannot be safely substituted for the parent.

---

### SAVE AND TRY

```js
class Vehicle {
  constructor(make, speed) {
    this.make = make;
    this.speed = speed;
  }

  describe() {
    return `${this.make} going ${this.speed} mph`;
  }
}

class ElectricVehicle extends Vehicle {
  constructor(make, speed, batteryPercent) {
    super(make, speed);
    this.batteryPercent = batteryPercent;
  }

  describe() {
    const base = super.describe();
    return `${base} (battery: ${this.batteryPercent}%)`;
  }
}

const car = new Vehicle("Toyota", 60);
const ev  = new ElectricVehicle("Tesla", 80, 73);

console.log(car.describe());   // → "Toyota going 60 mph"
console.log(ev.describe());    // → "Tesla going 80 mph (battery: 73%)"
```

Expected: base description, then extended description.

**Change something:** Add a `ChargeableVehicle extends ElectricVehicle` that adds a `chargeTime` field and includes it in `describe()` using `super.describe()` again. A three-level chain: `Vehicle → ElectricVehicle → ChargeableVehicle`. Verify that `super.describe()` in `ChargeableVehicle` calls `ElectricVehicle`'s describe (not `Vehicle`'s), demonstrating that `super` always refers to the immediate parent.

---

### Step 3 — `instanceof` and the Type Hierarchy

**The problem this step solves:** Check whether an object is an instance of a class or any of its superclasses.

**The code:**

```js
const circle = new Circle("red", 5);
const rectangle = new Rectangle("blue", 4, 6);

console.log(circle instanceof Circle);     // → true
console.log(circle instanceof Shape);      // → true   (Circle IS-A Shape)
console.log(circle instanceof Rectangle);  // → false

console.log(rectangle instanceof Shape);   // → true
console.log(rectangle instanceof Object);  // → true  (everything is an Object)
```

**`instanceof`** — the operator checks whether an object's prototype chain includes the prototype of the specified constructor. `circle instanceof Shape` is `true` because `Shape.prototype` is in `Circle`'s prototype chain. The chain: `circle → Circle.prototype → Shape.prototype → Object.prototype → null`.

**The walkthrough — `circle instanceof Shape`:**

JavaScript checks: does `circle`'s prototype chain include `Shape.prototype`? `circle.__proto__` is `Circle.prototype` — not `Shape.prototype`. `circle.__proto__.__proto__` is `Shape.prototype` — YES. Returns `true`.

**CS lens — a type hierarchy forms a directed acyclic graph:**

The class hierarchy forms a tree: `Object` is the root, `Shape` is below it, `Circle` and `Rectangle` are below `Shape`. `instanceof` asks: "is this node a descendant of that node in the tree?" A subclass instance is an instance of every class up to (and including) `Object`.

**SE lens — when to use instanceof:**

`instanceof` is appropriate when you need to handle different subtypes differently and cannot use polymorphism (for example, because you do not own the class). It is inappropriate when it replaces a design that should use method overriding — if you find yourself writing `if (obj instanceof Circle) { ... } else if (obj instanceof Rectangle) { ... }`, that is a sign the behavior should be a method on `Shape`, not a type check in the caller. The Open/Closed Principle (LAB-049) and polymorphism (LAB-015) address this directly.

**What breaks when you use instanceof instead of methods:**

```js
// BAD — violates Open/Closed Principle
function getDescription(shape) {
  if (shape instanceof Circle) {
    return `Circle with radius ${shape.radius}`;
  } else if (shape instanceof Rectangle) {
    return `Rectangle ${shape.width}x${shape.height}`;
  }
  // Adding a Triangle requires editing this function
}
```

Every new `Shape` subclass requires editing `getDescription`. With method overriding, `getDescription(shape)` simply calls `shape.describe()` — no `instanceof` needed, and adding a new subclass requires zero changes to `getDescription`.

---

### SAVE AND TRY

```js
const shapes = [new Circle("red", 5), new Rectangle("blue", 4, 6)];

shapes.forEach(shape => {
  console.log(`Is Circle: ${shape instanceof Circle}, Is Shape: ${shape instanceof Shape}`);
});
```

Expected: `Is Circle: true, Is Shape: true` for the first, `Is Circle: false, Is Shape: true` for the second.

**Change something:** Check `shapes[0] instanceof Object`. Expected: `true`. Every object in JavaScript is an instance of `Object`. Check `null instanceof Shape`. Expected: `false` — `null` is not an object and has no prototype chain.

---

## Connect the Pieces

**What you built:** `Shape` with `Circle` and `Rectangle` subclasses, method overriding with `super`, `instanceof` hierarchy checks, and a function that processes a mixed array of shapes polymorphically.

**How it connects to LAB-012:** In LAB-012, `BankAccount` was a standalone class. Inheritance is for when multiple related classes share a common interface. A `SavingsAccount` and `CheckingAccount` could both extend `BankAccount` — they share `deposit`, `withdraw`, `getStatement`, but differ in interest calculation or fee structure.

**How it connects to LAB-013:** Private fields in a parent class are **not** accessible to subclasses — this is stricter than Java/C#'s `protected`. If `Shape` had a `#color` private field instead of a public `color`, `Circle`'s constructor could not read `this.#color`. It would have to use a public getter. This is worth knowing: private fields are truly private, not "protected."

**How it connects forward:**

- **LAB-015 (Polymorphism):** A function that calls `shape.area()` without knowing whether `shape` is a `Circle` or `Rectangle` is polymorphism. You built this in Step 1 — you will formalize it in LAB-015.
- **LAB-016 (Abstraction):** `Shape.area()` throws an error because it has no implementation — it is an abstract method. In TypeScript (LAB-017), you declare it as `abstract area(): number` without an implementation. LAB-016 formalizes abstract classes.
- **LAB-050 (LSP):** The `SilentDog` example in Step 2 is an LSP violation. LAB-050 gives you the formal test for whether a subclass is valid.
- **LAB-054 (Composition over Inheritance):** You will see cases where inheritance creates problems (the fragile base class problem), and learn when to use composition instead. The shapes example is a good use of inheritance; the `Rectangle/Square` example from the Quick Check is a classic bad use.

**The real-world connection:**

Every React class component (`class MyComponent extends React.Component`) is a subclass. Every Express route handler middleware (`class AuthMiddleware extends BaseMiddleware`) is a subclass. Java and C# applications are built almost entirely from class hierarchies. TypeScript's class system is identical to JavaScript's with type annotations added. Understanding `extends`, `super`, and the prototype chain is necessary to read and contribute to any large object-oriented codebase.

---

## What Breaks Without This

**Concrete failure — duplicated code without inheritance:**

```js
// Without inheritance: every shape class duplicates describe()
class Circle {
  constructor(color, radius) { this.color = color; this.radius = radius; }
  describe() { return `A ${this.color} shape with area ${this.area().toFixed(2)}`; }
  area() { return Math.PI * this.radius * this.radius; }
}

class Rectangle {
  constructor(color, width, height) { this.color = color; this.width = width; this.height = height; }
  describe() { return `A ${this.color} shape with area ${this.area().toFixed(2)}`; }  // DUPLICATED
  area() { return this.width * this.height; }
}
```

`describe()` is identical in both classes — copied and pasted. When the requirement changes ("show area to 3 decimal places"), you must update every copy. Miss one, and they diverge silently. Inheritance solves this: `describe()` lives once in `Shape`, and all subclasses get the update automatically.

---

## Definition of Done

Verify each item before moving to LAB-015.

- [ ] `new Circle("red", 5).describe()` returns the correct string with area `78.54`
- [ ] `new Rectangle("blue", 4, 6).describe()` returns the correct string with area `24.00`
- [ ] A new `Triangle` subclass can be added and processed by the same `shapes.forEach` loop without modifying the loop
- [ ] `super.describe()` in a subclass calls the parent's `describe` and allows extension
- [ ] `circle instanceof Shape` returns `true`
- [ ] `circle instanceof Rectangle` returns `false`
- [ ] Omitting `super()` in a subclass constructor throws `ReferenceError`
- [ ] You can explain the prototype chain lookup for `circle.describe()`

**Git commit:**

```
git add .
git commit -m "LAB-014: Shape/Circle/Rectangle inheritance hierarchy — extends, super, method overriding, instanceof, prototype chain"
```

---

## Quick Check Answers

**1. Does `Car extends Vehicle` get `accelerate()` for free?**

Yes. Every public method defined on `Vehicle` is accessible on `Car` instances via the prototype chain. `car.accelerate()` works without `Car` defining `accelerate()` — JavaScript finds it on `Vehicle.prototype`. `Car` only needs to define methods that are new or different from `Vehicle`'s versions.

**2. What does `super(arg)` do in a subclass constructor?**

It calls the superclass's constructor with the given arguments. This initializes the object with whatever the parent constructor does — setting fields that belong to the parent, running parent validation, etc. It must be called before any use of `this` in the subclass constructor. Without it, the parent's initialization is skipped, and `this` is not available.

**3. What should happen to a Square's height when you call `setWidth(5)`?**

A `Square` must have equal sides. If `setWidth(5)` is called, `height` must also become `5`. But `Rectangle.setWidth` only changes width, not height — because for a `Rectangle`, width and height are independent. A `Square` that extends `Rectangle` and overrides `setWidth` to also change height **violates the Liskov Substitution Principle**: code written for `Rectangle` that assumes `setWidth` only changes width would produce wrong results when given a `Square`. This is the canonical LSP violation — `Square` cannot be safely substituted for `Rectangle` despite the is-a relationship in geometry. You will analyze this formally in LAB-050.

---

*Next: LAB-015 — Polymorphism*
