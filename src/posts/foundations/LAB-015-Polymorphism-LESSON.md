# FOUNDATIONS — LAB-015 — Polymorphism

**Series:** FOUNDATIONS — Part III: Object-Oriented Programming
**Environment:** Browser DevTools console (F12 → Console). All examples run directly there.
**Time:** 50–65 minutes.

---

## What You Will Build

A `renderAll(shapes)` function that calls `.draw()` on an array of mixed shape types — circles, rectangles, triangles — and produces the correct output for each without using `if`, `switch`, or `instanceof`. After this lab, you will be able to write code that works with any type that honors a contract, explain why this makes codebases open to extension without modification, and predict the precise execution path for any polymorphic call.

---

## What You Need to Know First

**From LAB-014 (Inheritance):** Subclasses inherit methods from their superclass. A method can be overridden to provide specialized behavior. The prototype chain is how JavaScript finds the correct method to call.

**From LAB-012 (Classes):** Instance methods use `this` to work with the instance's data. `this` is dynamically bound — its value is determined at call time by the object the method is called on.

---

> **Quick Check — try to answer before reading:**
>
> 1. A function receives an array of objects. Each object has a `.speak()` method. The function calls `.speak()` on each. Does the function need to know the concrete types to call the right method?
> 2. What does "duck typing" mean? (Hint: "If it walks like a duck and quacks like a duck, it is a duck.")
> 3. If you add a new class to a polymorphic system — one that implements the required interface — does any existing code need to change?
>
> *(Answers at the end of this lab)*

---

## The Lesson

---

### Step 1 — What Polymorphism Means: One Call, Many Behaviors

**The problem this step solves:** Establish the concept before writing any polymorphic code.

**The code:**

```js
class Cat   { speak() { return "meow"; } }
class Dog   { speak() { return "woof"; } }
class Duck  { speak() { return "quack"; } }

function makeNoise(animal) {
  return animal.speak();   // same call expression, different code runs
}

console.log(makeNoise(new Cat()));    // → "meow"
console.log(makeNoise(new Dog()));    // → "woof"
console.log(makeNoise(new Duck()));   // → "quack"
```

**The walkthrough:**

1. `makeNoise(new Cat())` is called. `animal` is the `Cat` instance.
2. `animal.speak()` — JavaScript looks for `speak` on the `Cat` instance. Found on `Cat.prototype`. Calls `Cat.prototype.speak`. Returns `"meow"`.
3. `makeNoise(new Dog())` is called. `animal` is the `Dog` instance. `animal.speak()` resolves to `Dog.prototype.speak`. Returns `"woof"`.
4. Each call to the same `makeNoise` function runs different code — determined by the runtime type of `animal`.

**CS lens — polymorphism defined:**

**Polymorphism** (from Greek: "many forms") means one interface, multiple implementations. The same method name (`speak`) produces different behavior depending on the object's type. The key: `makeNoise` does not know or care which concrete type `animal` is. It only knows that `animal` has a `speak()` method. The decision of which `speak` to run is made at runtime by the JavaScript engine — this is called **runtime polymorphism** or **dynamic dispatch**.

**SE lens — why polymorphism matters:**

Without polymorphism, `makeNoise` would contain a type switch:

```js
function makeNoise(animal) {
  if (animal instanceof Cat)  return "meow";
  if (animal instanceof Dog)  return "woof";
  if (animal instanceof Duck) return "quack";
  throw new Error("Unknown animal");
}
```

Every new animal type requires editing `makeNoise`. With polymorphism, adding `Cow` — a new class with `speak() { return "moo"; }` — requires zero changes to `makeNoise`. The polymorphic version is **open for extension** (new types work automatically) and **closed for modification** (existing code never changes). This is the Open/Closed Principle, which you will study formally in LAB-049.

**What breaks without polymorphism:**

Every caller that handles multiple types must be updated when a new type is added. In a large codebase, "add a new animal type" might require searching for every `instanceof Cat` or `switch (type)` block and adding a new case. One missed location causes silent bugs. Polymorphism collapses all of this to one location: the new class's method definition.

---

### SAVE AND TRY

```js
class Cat   { speak() { return "meow"; } }
class Dog   { speak() { return "woof"; } }
class Duck  { speak() { return "quack"; } }

const animals = [new Cat(), new Dog(), new Duck(), new Cat(), new Dog()];
const sounds = animals.map(animal => animal.speak());
console.log(sounds);
// → ["meow", "woof", "quack", "meow", "woof"]
```

Expected: five sounds in the right order, without any type checking.

**Change something:** Add `class Cow { speak() { return "moo"; } }` and add `new Cow()` to the array. Expected: `"moo"` appears in the correct position. The `map` call needed zero changes. This is the extension without modification experience.

---

### Step 2 — Polymorphism Through Inheritance

**The problem this step solves:** Show polymorphism where the shared interface is defined by a common superclass.

**The code:**

```js
class Shape {
  constructor(color) {
    this.color = color;
  }

  area() {
    throw new Error(`${this.constructor.name} must implement area()`);
  }

  draw() {
    return `Drawing a ${this.color} ${this.constructor.name} with area ${this.area().toFixed(2)}`;
  }
}

class Circle extends Shape {
  constructor(color, radius) {
    super(color);
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

function renderAll(shapes) {
  shapes.forEach(shape => console.log(shape.draw()));
}

renderAll([
  new Circle("red", 5),
  new Rectangle("blue", 4, 6),
  new Triangle("green", 3, 8),
]);
```

`this.constructor.name` — `constructor` is a property on every object that references the class that created it. `.name` is the class name as a string. `new Circle(...)` has `constructor = Circle`, so `constructor.name = "Circle"`. This avoids hardcoding the class name in `draw()`.

**The walkthrough — `shape.draw()` for a `Circle`:**

1. `shape.draw()` is called on a `Circle` instance.
2. JavaScript looks for `draw` on `Circle.prototype` — not found.
3. JavaScript walks to `Shape.prototype` — found.
4. `Shape.prototype.draw` runs with `this` = the `Circle` instance.
5. `this.color` is `"red"` (set by the `Circle` constructor via `super`).
6. `this.constructor.name` is `"Circle"`.
7. `this.area()` — JavaScript looks for `area` on the `Circle` instance. Found on `Circle.prototype`. Calls `Circle.prototype.area`.
8. Returns `Math.PI * 5 * 5 = 78.539...`.
9. `draw` returns `"Drawing a red Circle with area 78.54"`.

**CS lens — the delegation chain:**

`draw` (defined on `Shape`) calls `area` (defined on `Circle`). `Shape` delegates to `Circle` for the part it cannot handle itself. This is the template method pattern in miniature: the superclass defines the algorithm's structure (`draw` = color + name + area), and subclasses provide the varying part (`area`). Formal coverage in LAB-085.

**SE lens — single point of definition for shared behavior:**

`draw()` is written once. All subclasses get it. If the format changes ("show area to 3 decimal places"), one edit to `Shape.draw()` affects all shapes. Compare to the non-polymorphic version: each shape class would have its own `draw()` with the format duplicated — a DRY (Don't Repeat Yourself) violation. One definition, many types, consistent behavior.

**What breaks if a subclass forgets to implement `area()`:**

```js
class Star extends Shape {
  constructor(color, points) {
    super(color);
    this.points = points;
  }
  // area() not implemented
}

const star = new Star("yellow", 5);
star.draw();   // → Error: Star must implement area()
```

The error message names the specific class that failed. This is better than a cryptic `undefined.toFixed(2)` crash. The pattern — the superclass's method throws a descriptive error — is a lightweight approximation of abstract methods, which TypeScript and other typed languages enforce at compile time.

---

### SAVE AND TRY

```js
const shapes = [
  new Circle("red", 5),
  new Rectangle("blue", 4, 6),
  new Triangle("green", 3, 8),
];

function totalArea(shapes) {
  return shapes.reduce((total, shape) => total + shape.area(), 0);
}

console.log("Total area:", totalArea(shapes).toFixed(2));
// → "Total area:" (sum of all three areas)
```

Expected: the sum of circle area + rectangle area + triangle area.

**Change something:** Add `new Triangle("purple", 6, 4)` to the array. `totalArea` adds it automatically — no changes needed. Verify: the total increases by exactly `0.5 * 6 * 4 = 12`.

---

### Step 3 — Duck Typing: Polymorphism Without Inheritance

**The problem this step solves:** Show that polymorphism in JavaScript does not require a shared superclass — any object with the right method shape works.

**The code:**

```js
// These three classes share NO common superclass (other than Object)
class HttpLogger {
  log(message) {
    return `[HTTP] ${new Date().toISOString()}: ${message}`;
  }
}

class FileLogger {
  log(message) {
    return `[FILE] >> ${message}`;
  }
}

class ConsoleLogger {
  log(message) {
    return message;   // no decoration
  }
}

// This function works with ANY object that has a log() method
function processRequest(logger, requestPath) {
  logger.log(`Request started: ${requestPath}`);
  // ... do work ...
  logger.log(`Request completed: ${requestPath}`);
  return logger.log(`Summary for: ${requestPath}`);
}

console.log(processRequest(new HttpLogger(), "/api/users"));
console.log(processRequest(new FileLogger(), "/api/orders"));
console.log(processRequest(new ConsoleLogger(), "/health"));
```

**The walkthrough:**

`processRequest` receives a `logger` and calls `logger.log(...)`. JavaScript does not check whether `logger` is an instance of any particular class. It only checks, at runtime, whether `logger.log` is a callable function. If it is, the call succeeds. If it is not, a `TypeError` is thrown: `logger.log is not a function`.

`new Date().toISOString()` — `new Date()` creates a Date object representing the current moment. `.toISOString()` returns a string in the format `"2024-06-11T14:30:00.000Z"` — an ISO 8601 timestamp. Used here to show what a real logger might produce.

**CS lens — duck typing:**

**Duck typing** is the principle: "if it has a `log()` method, it is a logger." The type check is implicit — the program just tries to call the method, and if it works, the object is compatible. This is different from **nominal typing** (used in Java, C#, and TypeScript by default), where type compatibility is declared through class names or interface names. JavaScript uses duck typing exclusively at runtime. TypeScript adds structural typing on top: `{ log(msg: string): string }` describes the shape, and any object matching that shape is compatible, regardless of its class name.

**SE lens — programming to an interface, not a class:**

`processRequest` does not import `HttpLogger`, `FileLogger`, or `ConsoleLogger`. It has no dependency on any of them. It only depends on the concept "something that has a `log(message)` method." This is the dependency inversion principle (LAB-052) in action: high-level code (`processRequest`) depends on an abstraction (the `log` method), not on concrete classes. You can add a `SmsLogger`, a `SlackLogger`, or an `AuditLogger` without touching `processRequest`.

**What breaks if the interface is violated:**

```js
const brokenLogger = { write: msg => msg };   // has write(), not log()
processRequest(brokenLogger, "/api/test");    // → TypeError: logger.log is not a function
```

Duck typing provides no compile-time safety — the error appears only at runtime when the call is attempted. TypeScript's structural type system catches this at compile time: `function processRequest(logger: { log(msg: string): void }, ...)` — passing `brokenLogger` would produce a type error before the code runs. This is one motivation for TypeScript, covered in LAB-034.

---

### SAVE AND TRY

```js
class HttpLogger {
  log(message) { return `[HTTP] ${message}`; }
}

class FileLogger {
  log(message) { return `[FILE] ${message}`; }
}

// A plain object — not a class instance — but it has log()
const silentLogger = {
  log: message => `[SILENT]`   // logs nothing useful
};

function processWithLogger(logger, items) {
  items.forEach(item => console.log(logger.log(`Processing: ${item}`)));
}

processWithLogger(new HttpLogger(), ["order-1", "order-2"]);
processWithLogger(silentLogger, ["order-3", "order-4"]);
```

Expected: HTTP-prefixed logs, then silent logs. The `silentLogger` is a plain object, not a class instance — duck typing does not care.

**Change something:** Pass `null` as the logger. Expected: `TypeError: Cannot read properties of null (reading 'log')`. This is the duck typing failure mode — no interface declaration means no early warning. Pass `{ log: "not a function" }`. Expected: `TypeError: logger.log is not a function`.

---

### Step 4 — Polymorphism and the Open/Closed Principle

**The problem this step solves:** Show that a polymorphic system can be extended with new types without modifying any existing code.

**The code — a discount engine:**

```js
class FixedDiscount {
  calculate(price) {
    return Math.max(0, price - 10);   // $10 off
  }

  describe() {
    return "$10 flat discount";
  }
}

class PercentageDiscount {
  calculate(price) {
    return price * 0.8;   // 20% off
  }

  describe() {
    return "20% off";
  }
}

class NoDiscount {
  calculate(price) {
    return price;   // no change
  }

  describe() {
    return "full price";
  }
}

function applyDiscount(price, discountStrategy) {
  const finalPrice = discountStrategy.calculate(price);
  console.log(`${discountStrategy.describe()}: $${price} → $${finalPrice.toFixed(2)}`);
  return finalPrice;
}

applyDiscount(50, new FixedDiscount());        // → "$10 flat discount: $50 → $40.00"
applyDiscount(50, new PercentageDiscount());   // → "20% off: $50 → $40.00"
applyDiscount(50, new NoDiscount());           // → "full price: $50 → $50.00"
```

**The walkthrough — adding a new discount type:**

Requirement: add a "buy one get one 50% off" discount where the second item costs half.

```js
class BogohDiscount {
  calculate(price) {
    return price + price * 0.5;   // pay for one, get second at half price
  }

  describe() {
    return "BOGOH (second item 50% off)";
  }
}

applyDiscount(50, new BogohDiscount());   // → "BOGOH: $50 → $75.00"  (two items)
```

Zero changes to `applyDiscount`. Zero changes to the other discount classes. One new class. This is the Open/Closed Principle in its pure form: the system is **open for extension** (new discounts) and **closed for modification** (existing code unchanged).

**CS lens — the Strategy pattern:**

`discountStrategy` is a reference to a strategy object — a class that encapsulates one algorithm (discount calculation). `applyDiscount` uses whichever strategy is passed. Swapping the strategy changes the behavior at runtime without changing the structure. This is the **Strategy pattern** (LAB-084) — one of the most important design patterns, enabled directly by polymorphism.

**SE lens — the cost of not using polymorphism:**

```js
// Non-polymorphic version: must be modified for every new discount type
function applyDiscountBad(price, discountType) {
  if (discountType === "fixed")      return Math.max(0, price - 10);
  if (discountType === "percentage") return price * 0.8;
  if (discountType === "none")       return price;
  throw new Error("Unknown discount type");
}
```

Adding `"bogoh"` requires editing `applyDiscountBad`. In a large codebase, this function might be called from 20 places. Every caller must potentially be updated. Tests must be added to the existing test file. The risk of breaking something is proportional to the amount of code touched. Polymorphism minimizes the code touched.

**What breaks without this:**

Switch statements on type — `if (type === "circle")`, `switch (shape.kind)` — grow without bound as new types are added. Each addition touches existing code that already works. This is the source of the "shotgun surgery" code smell: one change requires many scattered edits. Polymorphism consolidates the change to one file: the new class.

---

### SAVE AND TRY

```js
class FixedDiscount      { calculate(p) { return p - 10; }  describe() { return "$10 off"; } }
class PercentageDiscount { calculate(p) { return p * 0.8; } describe() { return "20% off"; } }
class NoDiscount         { calculate(p) { return p; }        describe() { return "full price"; } }

const cart = [
  { name: "Widget", price: 29.99 },
  { name: "Gadget", price: 49.99 },
  { name: "Donut",  price: 4.99 },
];

function printCart(items, discountStrategy) {
  let total = 0;
  items.forEach(item => {
    const discounted = discountStrategy.calculate(item.price);
    total += discounted;
    console.log(`${item.name}: $${discounted.toFixed(2)}`);
  });
  console.log(`Total (${discountStrategy.describe()}): $${total.toFixed(2)}`);
}

printCart(cart, new NoDiscount());
printCart(cart, new PercentageDiscount());
```

Expected: full prices, then 20%-off prices.

**Change something:** Create a `StudentDiscount` class with `calculate(p) { return p * 0.7; }` (30% off). Pass `new StudentDiscount()` to `printCart`. Zero changes to `printCart`. This is the experience of working with a polymorphic API.

---

## Connect the Pieces

**What you built:** `renderAll` that works on any `Shape` subclass, duck-typing polymorphism with logger classes, and a discount engine extensible via new strategy classes.

**How it connects to LAB-014 (Inheritance):** Inheritance is the mechanism that enables polymorphism through shared superclasses. The prototype chain lookup is what makes `shape.draw()` call the correct `area()` implementation. Polymorphism is the outcome; the prototype chain is the implementation.

**How it connects to LAB-006 (First-Class Functions):** Duck typing and polymorphism both rely on "does this thing have the right method?" Functions as first-class values are the extreme version of duck typing — a function is any object that is callable. In JavaScript, a plain function object is polymorphic with any class's method by this principle.

**How it connects forward:**

- **LAB-016 (Abstraction):** Abstract classes formalize the "must implement area()" pattern with language-enforced rather than convention-enforced contracts.
- **LAB-017 (Interfaces):** TypeScript interfaces are the formal, compiler-checked version of duck typing. `interface Logger { log(message: string): void }` — TypeScript verifies that any object passed as `Logger` has the right shape.
- **LAB-049 (Open/Closed Principle):** The discount engine above is the OCP example. You saw it built here; LAB-049 formalizes the principle and names the violation.
- **LAB-084 (Strategy Pattern):** The discount strategy classes above are the canonical Strategy pattern example.

**The real-world connection:**

Polymorphism is the mechanism under every plugin system, every middleware chain, every event handler registry, and every framework's extensibility. When React renders your component (`<MyButton onClick={handleClick} />`), it calls `render()` on your component without knowing what type it is — polymorphism. When Node.js streams pass data through a pipe (`readStream.pipe(writeStream)`), both streams implement the same stream interface — duck typing. Polymorphism is not an academic idea; it is how large systems stay extensible.

---

## What Breaks Without This

**Concrete failure — type-switch that must grow:**

```js
// A renderer that cannot be extended without modification
function render(shape) {
  switch (shape.type) {
    case "circle":
      return `Circle: area ${Math.PI * shape.radius ** 2}`;
    case "rectangle":
      return `Rectangle: area ${shape.width * shape.height}`;
    // Every new shape type requires editing this function
    default:
      throw new Error(`Unknown shape type: ${shape.type}`);
  }
}
```

Add a `"triangle"` shape: edit this function, re-test all existing cases (risk of regression), add a new case, add tests for the new case. This is every addition.

With polymorphism: add a `Triangle` class with `draw()`, add one test file for `Triangle`. Zero edits to anything that already works. The difference in maintenance cost compounds over hundreds of types.

---

## Definition of Done

Verify each item before moving to LAB-016.

- [ ] `renderAll([circle, rectangle, triangle])` calls each shape's correct `area()` without type checks
- [ ] Adding a new `Shape` subclass to the array requires zero changes to `renderAll`
- [ ] `applyDiscount(price, discountStrategy)` works with any object that has `calculate()` and `describe()`
- [ ] A plain object (`{log: msg => msg}`) works as a polymorphic logger alongside class instances
- [ ] You can trace the prototype chain lookup for `circle.draw()` through `Circle.prototype` to `Shape.prototype`
- [ ] You can explain "duck typing" in one sentence

**Git commit:**

```
git add .
git commit -m "LAB-015: polymorphism — one interface, many implementations, no type switches, open/closed in practice"
```

---

## Quick Check Answers

**1. Does the function need to know the concrete types to call the right method?**

No. The function only needs to know the method name (`speak()`, `area()`, `log()`). The JavaScript runtime resolves which concrete implementation to call at the moment of the call, based on the actual type of the object. The function is written against the abstract method name; the concrete dispatch happens automatically.

**2. What does "duck typing" mean?**

"If it walks like a duck and quacks like a duck, treat it as a duck." In programming: if an object has the methods you need (`quack()`, `walk()`), use it, regardless of what class it belongs to or what hierarchy it is in. Type compatibility is determined by the shape of the object (which methods it has), not by its declared type or class name.

**3. If you add a new class to a polymorphic system, does any existing code need to change?**

No — this is the entire point of polymorphism. The new class implements the required interface (inherits from the superclass, or defines the required methods through duck typing). Existing code that works with the interface automatically works with the new class. Nothing existing is edited, nothing existing is retested for the new type. This property — being able to add new types without changing existing code — is what the Open/Closed Principle names and requires.

---

*Next: LAB-016 — Abstraction*
