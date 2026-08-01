# FOUNDATIONS — LAB-013 — Encapsulation

**Series:** FOUNDATIONS — Part III: Object-Oriented Programming
**Environment:** Browser DevTools console (F12 → Console). All examples run directly there.
**Time:** 50–65 minutes.

---

## What You Will Build

A `Temperature` class whose internal representation (stored in Kelvin, the scientific unit) is completely hidden from callers. The only way to read and write the temperature is through methods that validate input, enforce physical constraints, and convert to whatever unit the caller requests. After this lab, you will understand why hiding data behind methods is a design principle rather than a style preference — and how JavaScript's `#` private fields enforce it.

---

## What You Need to Know First

**From LAB-012 (Classes and Objects):** You know how to define a class with a constructor, instance methods, and properties. The `BankAccount` from LAB-012 had public `balance` — any caller could write `account.balance = 999999` and bypass all validation. This lab fixes that.

**The problem LAB-012 left open:** Every property set with `this.propertyName = value` in a constructor is publicly accessible and writable. There is nothing stopping external code from doing `account.balance = -1000`. Encapsulation solves this.

---

> **Quick Check — try to answer before reading:**
>
> 1. You have an object with a `balance` field. A bug sets `balance` to `-1000000`. You have no idea where in the codebase this happened. Why is a public field harder to debug than a private field with a setter?
> 2. What does an "invariant" mean in the context of a class? Give an example.
> 3. If a class stores temperature in Kelvin internally but lets callers read it in Celsius or Fahrenheit, what is the advantage over storing it in whichever unit the caller prefers?
>
> *(Answers at the end of this lab)*

---

## The Lesson

---

### Step 1 — The Problem with Public Fields

**The problem this step solves:** Show concretely what goes wrong when class data is publicly writable.

**The code:**

```js
class Temperature {
  constructor(celsius) {
    this.celsius = celsius;
  }
}

const water = new Temperature(100);
console.log(water.celsius);   // → 100  (boiling point)

// External code can set any value — no validation, no constraint
water.celsius = -500;   // impossible: absolute zero is -273.15°C
console.log(water.celsius);   // → -500  — the object now contains impossible data
```

**The walkthrough:**

`water.celsius = -500` is a direct property assignment on the object. JavaScript does not intercept or validate this. The `Temperature` class had no say — the assignment bypasses the constructor and all its validation. The object now contains a value that represents a physical impossibility (-500°C is below absolute zero, which cannot exist in the universe).

**CS lens — the invariant violation:**

An **invariant** is a condition that must always be true about an object's state. For `Temperature`, the invariant is: `celsius >= -273.15` (absolute zero). A public field has no mechanism to enforce this invariant — any code can break it with a simple assignment. The class is supposed to model a physical quantity; a public field makes it model only a number, with no guarantee the number is meaningful.

**SE lens — debugging public fields:**

When `water.celsius` is `-500`, how do you find the line that set it? You search the entire codebase for `water.celsius =` or `.celsius =`. In a large codebase, there may be dozens. You must read each one to find the bug. If `celsius` were private and only writable through a `setCelsius(value)` method, you add one `console.log` to that method and you immediately know every place that sets the value. Private fields **centralize** all writes to one point — the method — making debugging fast.

**What breaks without encapsulation:**

The moment any field is public, the class's invariants are unenforceable. All the validation in the constructor and methods can be bypassed with one direct assignment. The class becomes a struct — a bag of data — rather than an object with guaranteed properties. Every consumer must remember to call the setter rather than the field. They will not. Bugs will follow.

---

### SAVE AND TRY

```js
class Counter {
  constructor() {
    this.count = 0;
  }

  increment() { this.count++; }
  getValue() { return this.count; }
}

const counter = new Counter();
counter.increment();
counter.increment();
console.log(counter.getValue());   // → 2

// The invariant: count should only ever go up via increment()
// But nothing stops this:
counter.count = -1000;
console.log(counter.getValue());   // → -1000  (invariant broken)
```

Expected: `2`, then `-1000`. The `increment` method enforces a specific behavior; the direct assignment bypasses it completely.

**Change something:** Find the line that sets `count` to `-1000` and see how easy it was. Now imagine the codebase has 50 files — finding all writes to `.count` becomes a search problem, not a trivial fix.

---

### Step 2 — Private Fields with `#`

**The problem this step solves:** Make data inaccessible from outside the class, enforced by the language.

**The code:**

```js
class Temperature {
  #kelvin;   // private field declaration — the # prefix makes it private

  constructor(celsius) {
    this.#setCelsius(celsius);   // use the private setter to validate on construction
  }

  // Private method
  #setCelsius(celsius) {
    if (celsius < -273.15) {
      throw new Error(`${celsius}°C is below absolute zero (-273.15°C)`);
    }
    this.#kelvin = celsius + 273.15;   // store in Kelvin internally
  }

  // Public getters
  get celsius() {
    return this.#kelvin - 273.15;
  }

  get fahrenheit() {
    return (this.#kelvin - 273.15) * 9/5 + 32;
  }

  get kelvin() {
    return this.#kelvin;
  }

  // Public setter — validates before storing
  set celsius(value) {
    this.#setCelsius(value);
  }
}

const water = new Temperature(100);
console.log(water.celsius);      // → 100
console.log(water.fahrenheit);   // → 212
console.log(water.kelvin);       // → 373.15

water.celsius = 0;
console.log(water.fahrenheit);   // → 32  (freezing point)
```

**`#fieldName`** — the `#` prefix declares a **private field**. Private fields are:
- Only accessible inside the class body — not from subclasses, not from external code
- Enforced by the JavaScript engine — accessing `temperature.#kelvin` outside the class throws a `SyntaxError` at parse time
- Not visible to `console.log` or `Object.keys()` — they do not appear in the object's enumerable properties

**Field declaration `#kelvin;`** — private fields must be declared at the top of the class body before they can be used. The declaration states the name. No initial value is required (it will be `undefined` until assigned).

**`get celsius() { ... }`** — a **getter** is a method that is called as if it were a property read. `water.celsius` (no parentheses) calls the getter function. The caller interacts with it as if it were a field; the class runs validation or conversion logic.

**`set celsius(value) { ... }`** — a **setter** is called when a property is assigned. `water.celsius = 25` calls the setter with `value = 25`. The setter can validate, transform, and reject the value.

**The walkthrough — `water.celsius = 0` executes:**

1. `water.celsius = 0` — JavaScript recognizes `celsius` has a setter on `Temperature`. Calls `set celsius(0)`.
2. The setter calls `this.#setCelsius(0)`.
3. `#setCelsius` checks `0 >= -273.15` — passes.
4. `this.#kelvin = 0 + 273.15 = 273.15`. The private field is updated.
5. `water.fahrenheit` triggers the getter. Returns `(273.15 - 273.15) * 9/5 + 32 = 32`. Freezing point. Correct.

**CS lens — a single representation, multiple views:**

The internal representation is Kelvin. Celsius and Fahrenheit are **views** of that representation, computed on demand. This is a key design decision: instead of keeping multiple copies of the temperature (celsius, fahrenheit, kelvin — three fields that must always be kept in sync), there is one source of truth (`#kelvin`) and all conversions are derived. Keeping multiple fields in sync is error-prone; keeping one field and computing the rest is correct by construction.

**SE lens — information hiding:**

The caller does not know that the temperature is stored in Kelvin. They cannot depend on that implementation detail. If tomorrow you change the internal representation to something else (Rankine, perhaps, or a more precise floating-point format), no external code needs to change — only the class's internals. This is **information hiding**: the implementation details are hidden inside the class boundary. Callers only know the interface (`celsius`, `fahrenheit`, `kelvin` properties).

**What breaks without getters/setters:**

Without a setter, `water.celsius = 0` would silently add a new `celsius` **property** to the instance — shadowing the getter — without calling any validation. The `#kelvin` field would not be updated. `water.fahrenheit` would still return the old value. Getters and setters prevent callers from bypassing the class's logic.

---

### SAVE AND TRY

```js
const body = new Temperature(37);   // normal human body temperature
console.log(`Body temp: ${body.celsius.toFixed(1)}°C = ${body.fahrenheit.toFixed(1)}°F`);

try {
  body.celsius = -300;   // below absolute zero — should throw
} catch (error) {
  console.log("Rejected:", error.message);
}

console.log("Temperature unchanged:", body.celsius.toFixed(1));   // → 37.0
```

Expected: the body temperature prints, the invalid assignment throws and is caught, the temperature remains `37`.

**Change something:** Try `body.#kelvin` from outside the class. Expected: `SyntaxError: Private field '#kelvin' must be declared in an enclosing class`. The engine refuses to even parse the access — it is not a runtime error, it is caught at parse time. This is stronger than conventional privacy — it is enforced before execution begins.

---

### Step 3 — Enforcing an Invariant Through All Modification Paths

**The problem this step solves:** Show that all paths to modifying private state must go through validation.

**The code:**

```js
class Stack {
  #items = [];    // private field with inline initializer
  #maxSize;

  constructor(maxSize) {
    if (!Number.isInteger(maxSize) || maxSize <= 0) {
      throw new Error("maxSize must be a positive integer");
    }
    this.#maxSize = maxSize;
  }

  push(item) {
    if (this.#items.length >= this.#maxSize) {
      throw new Error(`Stack is full (capacity: ${this.#maxSize})`);
    }
    this.#items.push(item);
    return this;
  }

  pop() {
    if (this.#items.length === 0) {
      throw new Error("Cannot pop from an empty stack");
    }
    return this.#items.pop();
  }

  peek() {
    if (this.#items.length === 0) return undefined;
    return this.#items[this.#items.length - 1];
  }

  get size() {
    return this.#items.length;
  }

  get isEmpty() {
    return this.#items.length === 0;
  }

  get isFull() {
    return this.#items.length >= this.#maxSize;
  }
}
```

`#items = []` — private field with an **inline initializer**. Instead of assigning in the constructor, the field is initialized directly in the class body. This is equivalent to `this.#items = []` in the constructor. Inline initialization makes field defaults visible at a glance.

`Number.isInteger(maxSize)` — a built-in JavaScript function that returns `true` if `maxSize` is a finite integer (no decimal part). `Number.isInteger(3)` returns `true`. `Number.isInteger(3.5)` returns `false`. `Number.isInteger("3")` returns `false` — it checks both type and value.

**The invariants this class enforces:**

1. `#items.length <= #maxSize` — never exceeds capacity. Enforced by `push`.
2. `#items.length >= 0` — never negative. Enforced by `pop` (no attempt to pop beyond empty).
3. `#maxSize` is a positive integer — set once at construction, never changes.

**The walkthrough — `stack.push(item)` executes:**

1. `push` is called. Checks `this.#items.length >= this.#maxSize`. If full, throws.
2. Calls `this.#items.push(item)` — appends to the private array.
3. Returns `this` for chaining.

External code cannot call `this.#items.push(item)` directly — `#items` is private. The only way to add an item is through `push`. `push` checks capacity. The capacity invariant is therefore unbreakable from outside the class.

**CS lens — encapsulation = controlled access + invariant enforcement:**

Encapsulation has two parts: (1) bundling data and behavior into one unit (the class), and (2) restricting access to the data so the invariants can be enforced. Part 1 without part 2 is just grouping. Both parts together is what makes an object trustworthy — callers can depend on its invariants being true, always.

**SE lens — the two benefits of encapsulation:**

**Benefit 1 — correctness:** A `Stack` with private `#items` is either correctly sized (1 to maxSize items) or has thrown an error. There is no in-between. Code that receives a `Stack` can trust it is in a valid state. Code that receives a public array has no such guarantee.

**Benefit 2 — changeability:** The implementation of `#items` can change — from an array to a linked list to a circular buffer — without changing the public interface. Callers use `push`, `pop`, `peek`, and `size`. They do not know or care what data structure is used internally. Changing the internals does not break callers.

**What breaks without all paths going through validation:**

If `#items` had a public getter returning the real array (`get items() { return this.#items; }`), callers could bypass `push`: `stack.items.push("extra item")`. The capacity check would be bypassed. The invariant would be broken. If you must expose the array, expose a copy: `get items() { return [...this.#items]; }`. Reading a copy is safe; modifying a copy does not affect the real data.

---

### SAVE AND TRY

```js
const stack = new Stack(3);
stack.push("first").push("second").push("third");
console.log("Size:", stack.size);      // → 3
console.log("Full:", stack.isFull);    // → true

try {
  stack.push("fourth");   // exceeds max
} catch (error) {
  console.log("Rejected:", error.message);
}

console.log(stack.pop());   // → "third"
console.log("Size:", stack.size);   // → 2
```

Expected: size `3`, full `true`, rejection error, then `"third"` popped, size `2`.

**Change something:** Try an empty stack: `const empty = new Stack(5); empty.pop()`. Expected: "Cannot pop from an empty stack." Try `new Stack(0)`. Expected: constructor error. Try `new Stack(2.5)`. Expected: constructor error. Try `stack.#items`. Expected: `SyntaxError` — private field access denied.

---

## Connect the Pieces

**What you built:** A `Temperature` class with private Kelvin storage and public Celsius/Fahrenheit views, and a `Stack` class with enforced capacity invariants — both using JavaScript's `#` private fields.

**How it connects to LAB-012 (Classes):** In LAB-012, `account.balance` was public and writable. This lab replaces public fields with private fields and getters/setters. The `BankAccount` from LAB-012 can now be secured: `#balance` instead of `balance`, a `deposit()` method as the only write path.

**How it connects to LAB-007 (Closures):** Private fields achieve what the module pattern from LAB-007 achieved with closures — inaccessible-from-outside state. The difference: private fields are per-instance (each `Stack` instance has its own private `#items`), while closures in the module pattern are per-factory-call. Private fields are the standardized, idiomatic mechanism.

**How it connects forward:**

- **LAB-014 (Inheritance):** Private fields in a parent class are NOT inherited by subclasses — subclasses cannot access `#items` even in their own methods. This is different from `protected` in Java/C#. Understanding this prevents inheritance-related bugs.
- **LAB-048 (SRP — Single Responsibility Principle):** The `Stack` class has one responsibility: maintain a bounded LIFO collection. Encapsulation is what makes the responsibility clean — the class owns its data and its invariants, nothing outside it does.
- **LAB-055 (Tell Don't Ask):** Encapsulation is the prerequisite for "Tell Don't Ask." When data is private, callers cannot "ask" for it and make decisions externally — they must "tell" the object what to do. `stack.push(item)` tells. `stack.items.push(item)` asks.

**The real-world connection:**

Every well-designed library and framework uses encapsulation. React's component state is private — you can only update it through `setState` or `useState` setters, never directly. Database ORMs return entity objects where field access is controlled through getters that trigger queries. Authentication libraries store tokens in private fields — your code receives a client object, not the raw token. Private data is not paranoia — it is a contract that makes code reliable.

---

## What Breaks Without This

**Concrete failure — invariant violation through direct field access:**

```js
class BoundedList {
  constructor(maxSize) {
    this.items = [];       // public — fatal mistake
    this.maxSize = maxSize;
  }

  add(item) {
    if (this.items.length >= this.maxSize) throw new Error("Full");
    this.items.push(item);
  }
}

const list = new BoundedList(3);
list.add("a"); list.add("b"); list.add("c");
// Should be full — but:
list.items.push("d");   // bypass the 'add' guard completely
list.items.push("e");
console.log(list.items.length);   // → 5, exceeds maxSize of 3
```

The invariant (`items.length <= maxSize`) is broken. If any part of the program depends on the list never exceeding 3 items, it will now behave incorrectly — and the failure happens silently, far from the line that caused it. Private fields make this physically impossible: `list.#items.push("d")` is a `SyntaxError`.

---

## Definition of Done

Verify each item before moving to LAB-014.

- [ ] `new Temperature(100).celsius` returns `100`
- [ ] `new Temperature(100).fahrenheit` returns `212`
- [ ] `new Temperature(-300)` throws (below absolute zero)
- [ ] `temperature.celsius = 50` updates the temperature correctly
- [ ] `temperature.#kelvin` outside the class throws `SyntaxError`
- [ ] `Stack` with `maxSize=2`: after two pushes, a third throws
- [ ] An empty `Stack.pop()` throws
- [ ] `stack.#items` outside the class throws `SyntaxError`

**Git commit:**

```
git add .
git commit -m "LAB-013: encapsulation with private fields — Temperature class enforces physical constraints, Stack enforces capacity invariant"
```

---

## Quick Check Answers

**1. Why is a public field harder to debug than a private field with a setter?**

With a public field, any code anywhere can write to it: `account.balance = -1000` can appear in 50 different files. Finding the bug requires searching the entire codebase. With a private field and a single setter, all writes go through one function. Adding one `console.log` or breakpoint to that function reveals every write that happens, immediately showing where the bad value originated. Centralized writes mean centralized debugging.

**2. What does "invariant" mean for a class?**

An invariant is a condition that must be true about an object's state at all times — before every public method call and after every public method call. For `Stack`, the invariant is `0 <= items.length <= maxSize`. For `Temperature`, the invariant is `kelvin >= 0` (absolute zero). For `BankAccount`, the invariant is `balance >= 0`. Invariants are what make an object trustworthy — callers can rely on these conditions without checking them every time.

**3. What is the advantage of storing temperature in Kelvin and computing Celsius/Fahrenheit on demand?**

A single internal representation prevents inconsistency. If all three were stored as fields and you changed one, you would need to update all three in sync. A bug that changes only one would leave the object in a state where `celsius` and `fahrenheit` report contradictory values. With one canonical field (Kelvin), there is one source of truth. All conversions are derived from it — they cannot disagree. This is the "single source of truth" principle, applied at the object level.

---

*Next: LAB-014 — Inheritance*
