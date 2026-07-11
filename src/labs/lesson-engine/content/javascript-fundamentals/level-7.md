---
series: javascript-fundamentals
level: 7
title: Classes
lang: javascript
---

# Classes

A class is a template for creating objects that share the same shape and behaviour. Without classes, creating ten "user" objects means ten separate object literals, duplicating method code in each one. A class defines the structure once; you create as many instances as you need.

This lesson teaches how to declare classes, use the constructor, add methods, and understand `this`.

## The Problem Classes Solve

Imagine creating two objects with the same shape without a class:

```javascript
const userA = {
  name: "Ada",
  email: "ada@example.com",
  greet() { return `Hi, I'm ${this.name}` },
}

const userB = {
  name: "Grace",
  email: "grace@example.com",
  greet() { return `Hi, I'm ${this.name}` },
}

console.log(userA.greet())
console.log(userB.greet())
```

```text
Hi, I'm Ada
Hi, I'm Grace
```

`this` — inside a method, `this` refers to the object the method was called on. `userA.greet()` sets `this` to `userA`, so `this.name` is `"Ada"`.

The problem: `greet` is duplicated. Adding a method means editing every object. A class solves this.

## Declaring a Class

```javascript
class User {
  constructor(name, email) {
    this.name = name
    this.email = email
  }

  greet() {
    return `Hi, I'm ${this.name}`
  }

  describe() {
    return `${this.name} <${this.email}>`
  }
}

const userA = new User("Ada", "ada@example.com")
const userB = new User("Grace", "grace@example.com")

console.log(userA.greet())
console.log(userB.describe())
```

```text
Hi, I'm Ada
Grace <grace@example.com>
```

`class User { }` — declares a class named `User`. By convention, class names are PascalCase (each word capitalised, no underscores).

`constructor(name, email)` — a special method called automatically when `new User(...)` is used. It receives the arguments and sets up the instance.

`this.name = name` — `this` inside the constructor refers to the new instance being created. `this.name = name` stores `name` as a property of the instance.

`new User("Ada", "ada@example.com")` — creates a new instance. `new` allocates memory, calls `constructor`, and returns the new object.

`greet()` and `describe()` — **instance methods**: functions defined on the class that all instances share. They are defined once on the class, not duplicated in each object.

**CS lens:** Methods are stored once on the class's **prototype** object. When you call `userA.greet()`, JavaScript looks up `greet` on `userA`, does not find it, then checks `userA`'s prototype (the `User` class), finds it there, and calls it with `this` bound to `userA`. All instances share one copy of each method — O(1) memory per method regardless of how many instances you create.

## this — Context Binding

`this` is bound to the object on the left of the dot at call time:

```javascript
class Rectangle {
  constructor(width, height) {
    this.width = width
    this.height = height
  }

  area() {
    return this.width * this.height
  }

  perimeter() {
    return 2 * (this.width + this.height)
  }

  describe() {
    return `${this.width}×${this.height}: area=${this.area()}, perimeter=${this.perimeter()}`
  }
}

const small = new Rectangle(3, 4)
const large = new Rectangle(10, 6)

console.log(small.describe())
console.log(large.describe())
```

```text
3×4: area=12, perimeter=14
10×6: area=60, perimeter=32
```

`this.area()` inside `describe` — calls the `area` method on the same instance. `this` is the same object throughout the call.

**Enable Debug and step through `small.describe()`.** Watch `this.width` and `this.height` in the variables panel — they are `3` and `4`. When `describe` calls `this.area()`, a new frame appears with the same `this`.

## Inheritance

A class can **extend** another class, inheriting its methods and adding new ones:

```javascript
class Animal {
  constructor(name) {
    this.name = name
  }

  speak() {
    return `${this.name} makes a sound.`
  }
}

class Dog extends Animal {
  speak() {
    return `${this.name} barks.`
  }
}

class Cat extends Animal {
  speak() {
    return `${this.name} meows.`
  }
}

const dog = new Dog("Rex")
const cat = new Cat("Whiskers")
const animals = [dog, cat]

for (const animal of animals) {
  console.log(animal.speak())
}
```

```text
Rex barks.
Whiskers meows.
```

`class Dog extends Animal` — `Dog` inherits everything from `Animal`. `Dog` overrides `speak()` with its own version.

`animal.speak()` — JavaScript looks up `speak` on the actual object's class, not the declared type. `dog.speak()` calls `Dog.speak`. This is **polymorphism**: different objects responding differently to the same method call. The `for...of` loop calls `speak()` without knowing or caring whether each animal is a Dog or a Cat.

**CS lens:** This lookup (check own class first, then parent class, then grandparent) is **prototype chain traversal** — the same mechanism used for plain object property lookup. The prototype chain is the runtime data structure behind both object property access and class inheritance.

## Arrow Functions and this

Arrow functions do not have their own `this` — they inherit it from the surrounding scope. This matters when using methods as callbacks:

```javascript
class Timer {
  constructor() {
    this.count = 0
  }

  tick() {
    this.count += 1
    return this.count
  }
}

const timer = new Timer()
const ticks = [1, 2, 3].map(() => timer.tick())

console.log(ticks)
console.log(timer.count)
```

```text
[ 1, 2, 3 ]
3
```

`() => timer.tick()` — the arrow function calls `timer.tick()` explicitly, which correctly binds `this` to `timer`. The arrow function itself does not use `this`.

**SE lens:** If you write `[1,2,3].map(timer.tick)` (passing the method as a callback without calling it), `this` inside `tick` would be `undefined` (in strict mode) and the method would fail. Always be explicit about how `this` is bound when passing methods as callbacks.

## Challenge: stack

Write a class `Stack` that implements a last-in, first-out data structure with three methods:

- `push(item)` — adds `item` to the top. Returns nothing.
- `pop()` — removes and returns the top item. Returns `undefined` if empty.
- `peek()` — returns the top item without removing it. Returns `undefined` if empty.
- `get size()` — a getter that returns the number of items. Use `get size() { return ... }` syntax.

Store items in an array property `this.items`. The "top" of the stack is the last element of the array.

```challenge
class Stack {
  constructor() {
    this.items = []
  }

  push(item) {
    // TODO
  }

  pop() {
    // TODO
  }

  peek() {
    // TODO
  }

  get size() {
    // TODO
  }
}
```

```test
const s = new Stack()
assert s.size === 0
s.push(1); s.push(2); s.push(3)
assert s.size === 3
assert s.peek() === 3
assert s.pop() === 3
assert s.size === 2
```
